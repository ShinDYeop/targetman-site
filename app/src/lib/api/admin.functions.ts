import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { env } from "cloudflare:workers";

import { bindings } from "../bindings.server";

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

function passwordOk(input: string) {
  const expected = (env as unknown as { ADMIN_PASSWORD?: string }).ADMIN_PASSWORD;
  if (!expected) return false;
  if (input.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) {
    diff |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export const listRequests = createServerFn({ method: "POST" })
  .inputValidator(z.object({ password: z.string().min(1).max(200) }))
  .handler(async ({ data }) => {
    if (!passwordOk(data.password)) {
      return { ok: false as const, reason: "unauthorized" };
    }
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
