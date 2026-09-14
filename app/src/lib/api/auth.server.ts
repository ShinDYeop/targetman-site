import { env } from "cloudflare:workers";

import { bindings } from "../bindings.server";
import { sha256Hex, sleep, timingSafeEqualHex } from "./security.server";

const WINDOW_MS = 15 * 60 * 1000;
const HARD_LOCK_AFTER = 30;

export type AdminCheck = { ok: true } | { ok: false; reason: string };

async function recentFailures(): Promise<number> {
  const { DB } = bindings();
  if (!DB) return 0;
  try {
    const since = new Date(Date.now() - WINDOW_MS).toISOString();
    const row = await DB.prepare(
      "SELECT COUNT(*) AS n FROM admin_attempts WHERE ok = 0 AND created_at > ?",
    )
      .bind(since)
      .first<{ n: number }>();
    return row?.n ?? 0;
  } catch {
    return 0;
  }
}

async function logAttempt(ok: boolean): Promise<void> {
  const { DB } = bindings();
  if (!DB) return;
  try {
    await DB.prepare("INSERT INTO admin_attempts (created_at, ok) VALUES (?, ?)")
      .bind(new Date().toISOString(), ok ? 1 : 0)
      .run();
  } catch {
    /* 기록 실패가 로그인 실패가 되면 안 됩니다 */
  }
}

/**
 * 관리자 확인. 실패가 쌓일수록 응답이 느려지고, 15분 안에 30회 실패하면 잠깁니다.
 * 해시끼리 비교하므로 비밀번호 길이도 드러나지 않습니다.
 */
export async function requireAdmin(password: string): Promise<AdminCheck> {
  const expected = (env as unknown as { ADMIN_PASSWORD?: string }).ADMIN_PASSWORD;
  if (!expected) return { ok: false, reason: "not_configured" };

  const failures = await recentFailures();
  if (failures >= HARD_LOCK_AFTER) return { ok: false, reason: "locked" };
  if (failures > 0) await sleep(Math.min(failures * 400, 4000));

  const [given, want] = await Promise.all([sha256Hex(password), sha256Hex(expected)]);
  if (!timingSafeEqualHex(given, want)) {
    await logAttempt(false);
    return { ok: false, reason: "unauthorized" };
  }
  await logAttempt(true);
  return { ok: true };
}

/** 라우트 핸들러용. 헤더로 받은 비밀번호를 확인합니다. */
export async function requireAdminHeader(request: Request): Promise<AdminCheck> {
  const pw = request.headers.get("x-admin-password") ?? "";
  if (!pw) return { ok: false, reason: "unauthorized" };
  return requireAdmin(pw);
}
