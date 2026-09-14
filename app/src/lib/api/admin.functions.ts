import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { env } from "cloudflare:workers";

import { bindings } from "../bindings.server";
import { purgeExpired, sha256Hex, sleep, timingSafeEqualHex } from "./security.server";

export type RequestRow = {
  id: number;
  created_at: string;
  brand: string;
  model: string;
  contract_type: string;
  term_months: string;
  annual_km: string;
  owner_type: string;
  budget: string;
  timing: string;
  name: string;
  phone: string;
  call_window: string;
  memo: string;
  src: string;
  marketing_optin: number;
};

const WINDOW_MS = 15 * 60 * 1000;
const HARD_LOCK_AFTER = 30;

/** 최근 실패 횟수만큼 응답을 늦춰 무차별 대입의 비용을 올립니다. */
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

export const listRequests = createServerFn({ method: "POST" })
  .inputValidator(z.object({ password: z.string().min(1).max(200) }))
  .handler(async ({ data }) => {
    const expected = (env as unknown as { ADMIN_PASSWORD?: string }).ADMIN_PASSWORD;
    if (!expected) return { ok: false as const, reason: "not_configured" };

    const failures = await recentFailures();
    if (failures >= HARD_LOCK_AFTER) {
      return { ok: false as const, reason: "locked" };
    }
    if (failures > 0) {
      await sleep(Math.min(failures * 400, 4000));
    }

    const [given, want] = await Promise.all([sha256Hex(data.password), sha256Hex(expected)]);
    if (!timingSafeEqualHex(given, want)) {
      await logAttempt(false);
      return { ok: false as const, reason: "unauthorized" };
    }
    await logAttempt(true);
    await purgeExpired();

    const { DB } = bindings();
    if (!DB) return { ok: false as const, reason: "storage_unavailable" };

    const res = await DB.prepare(
      `SELECT id, created_at, brand, model, contract_type, term_months, annual_km,
              owner_type, budget, timing, name, phone, call_window, memo, src, marketing_optin
         FROM quote_requests
        ORDER BY created_at DESC
        LIMIT 300`,
    ).all<RequestRow>();

    return { ok: true as const, rows: (res.results ?? []) as RequestRow[] };
  });
