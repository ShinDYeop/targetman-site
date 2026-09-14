import { bindings } from "../bindings.server";

/**
 * 제어문자와 보이지 않는 문자를 걷어냅니다. 저장과 표시 양쪽에서 사고를 막습니다.
 * 소스에 실제 제어문자를 넣지 않으려고 문자열로 만들어 컴파일합니다.
 */
const CONTROL = new RegExp("[\\u0000-\\u001F\\u007F\\u200B-\\u200D\\uFEFF]", "g");
const CONTROL_KEEP_NEWLINE = new RegExp(
  "[\\u0000-\\u0009\\u000B\\u000C\\u000E-\\u001F\\u007F\\u200B-\\u200D\\uFEFF]",
  "g",
);

export function clean(value: string, max: number): string {
  return value.replace(CONTROL, "").replace(/[ \t]+/g, " ").trim().slice(0, max);
}

export function cleanMultiline(value: string, max: number): string {
  return value
    .replace(/\r\n/g, "\n")
    .replace(CONTROL_KEEP_NEWLINE, "")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim()
    .slice(0, max);
}

export function phoneKey(value: string): string {
  return value.replace(/\D/g, "").slice(0, 15);
}

export function looksLikePhone(value: string): boolean {
  const digits = phoneKey(value);
  return digits.length >= 9 && digits.length <= 13;
}

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const RETENTION_DAYS = 180;
const PER_PHONE_PER_HOUR = 3;
const GLOBAL_PER_HOUR = 60;
const MIN_FILL_MS = 2500;

export type Guard = { ok: true } | { ok: false; reason: string };

/**
 * 사람이 실제로 작성한 요청인지, 같은 번호가 도배하고 있지 않은지 확인합니다.
 * IP는 이 런타임에서 신뢰할 수 있게 얻기 어려워, 봇 신호와 번호 단위 빈도로 막습니다.
 */
export async function guardSubmission(input: {
  phone: string;
  honeypot: string;
  elapsedMs: number;
}): Promise<Guard> {
  if (input.honeypot.trim() !== "") return { ok: false, reason: "spam" };
  if (!Number.isFinite(input.elapsedMs) || input.elapsedMs < MIN_FILL_MS) {
    return { ok: false, reason: "too_fast" };
  }
  if (!looksLikePhone(input.phone)) return { ok: false, reason: "bad_phone" };

  const { DB } = bindings();
  if (!DB) return { ok: false, reason: "storage_unavailable" };

  const since = new Date(Date.now() - HOUR).toISOString();
  const key = phoneKey(input.phone);

  const mine = await DB.prepare(
    "SELECT COUNT(*) AS n FROM submit_log WHERE phone_key = ? AND created_at > ?",
  )
    .bind(key, since)
    .first<{ n: number }>();
  if ((mine?.n ?? 0) >= PER_PHONE_PER_HOUR) return { ok: false, reason: "rate_phone" };

  const all = await DB.prepare("SELECT COUNT(*) AS n FROM submit_log WHERE created_at > ?")
    .bind(since)
    .first<{ n: number }>();
  if ((all?.n ?? 0) >= GLOBAL_PER_HOUR) return { ok: false, reason: "rate_global" };

  return { ok: true };
}

export async function recordSubmission(phone: string): Promise<void> {
  const { DB } = bindings();
  if (!DB) return;
  try {
    await DB.prepare("INSERT INTO submit_log (created_at, phone_key) VALUES (?, ?)")
      .bind(new Date().toISOString(), phoneKey(phone))
      .run();
  } catch {
    /* 로그 실패가 접수 실패가 되면 안 됩니다 */
  }
}

/**
 * 개인정보처리방침에 적은 보관기간을 코드가 실제로 지키게 합니다.
 * 접수가 있을 때마다 지난 기록을 정리합니다.
 */
export async function purgeExpired(): Promise<void> {
  const { DB } = bindings();
  if (!DB) return;
  const now = Date.now();
  try {
    await DB.prepare("DELETE FROM quote_requests WHERE created_at < ?")
      .bind(new Date(now - RETENTION_DAYS * DAY).toISOString())
      .run();
    await DB.prepare("DELETE FROM submit_log WHERE created_at < ?")
      .bind(new Date(now - DAY).toISOString())
      .run();
    await DB.prepare("DELETE FROM admin_attempts WHERE created_at < ?")
      .bind(new Date(now - DAY).toISOString())
      .run();
  } catch {
    /* 정리 실패가 접수 실패가 되면 안 됩니다 */
  }
}

export async function sha256Hex(value: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** 길이까지 숨기려고 해시를 비교합니다. 두 값 모두 64자입니다. */
export function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== 64 || b.length !== 64) return false;
  let diff = 0;
  for (let i = 0; i < 64; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
