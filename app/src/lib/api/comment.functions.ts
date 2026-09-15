import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { bindings } from "../bindings.server";
import { clean, cleanMultiline } from "./security.server";

const HOUR = 60 * 60 * 1000;
/** 사람이 직접 썼는지 보는 최소 작성 시간. 봇은 즉시 제출합니다. */
const MIN_FILL_MS = 2500;
const PER_REVIEW_PER_HOUR = 3;
const GLOBAL_PER_HOUR = 20;

/**
 * 공개 댓글 접수. 바로 게시하지 않고 approved = 0 으로 넣습니다.
 * 사장님이 관리자에서 확인하고 승인해야 사이트에 나갑니다.
 */
export const submitComment = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      reviewId: z.number(),
      name: z.string().min(1).max(20),
      body: z.string().min(2).max(500),
      hp: z.string().max(200).default(""),
      elapsedMs: z.number().default(0),
    }),
  )
  .handler(async ({ data }) => {
    if (data.hp.trim() !== "") return { ok: false as const, reason: "spam" };
    if (!Number.isFinite(data.elapsedMs) || data.elapsedMs < MIN_FILL_MS) {
      return { ok: false as const, reason: "too_fast" };
    }

    const name = clean(data.name, 20);
    const body = cleanMultiline(data.body, 500);
    const reviewId = Math.floor(data.reviewId);
    if (!name || body.length < 2 || reviewId <= 0) {
      return { ok: false as const, reason: "invalid" };
    }

    const { DB } = bindings();
    if (!DB) return { ok: false as const, reason: "storage_unavailable" };

    // 실제로 공개된 후기에만 달 수 있습니다.
    const target = await DB.prepare("SELECT id FROM reviews WHERE id = ? AND published = 1")
      .bind(reviewId)
      .first<{ id: number }>();
    if (!target) return { ok: false as const, reason: "no_review" };

    // 도배 방지. submit_log 를 같이 쓰되 키 앞에 c 를 붙여 견적 요청과 섞이지 않게 합니다.
    const since = new Date(Date.now() - HOUR).toISOString();
    const key = `c${reviewId}`;
    const mine = await DB.prepare(
      "SELECT COUNT(*) AS n FROM submit_log WHERE phone_key = ? AND created_at > ?",
    )
      .bind(key, since)
      .first<{ n: number }>();
    if ((mine?.n ?? 0) >= PER_REVIEW_PER_HOUR) return { ok: false as const, reason: "rate" };

    const all = await DB.prepare(
      "SELECT COUNT(*) AS n FROM submit_log WHERE phone_key LIKE 'c%' AND created_at > ?",
    )
      .bind(since)
      .first<{ n: number }>();
    if ((all?.n ?? 0) >= GLOBAL_PER_HOUR) return { ok: false as const, reason: "rate" };

    const now = new Date().toISOString();
    await DB.prepare(
      "INSERT INTO comments (review_id, name, body, approved, created_at) VALUES (?,?,?,0,?)",
    )
      .bind(reviewId, name, body, now)
      .run();
    await DB.prepare("INSERT INTO submit_log (created_at, phone_key) VALUES (?, ?)")
      .bind(now, key)
      .run();

    return { ok: true as const };
  });
