import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { bindings } from "../bindings.server";
import { requireAdmin } from "./auth.server";
import { purgeExpired } from "./security.server";

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

export const listRequests = createServerFn({ method: "POST" })
  .inputValidator(z.object({ password: z.string().min(1).max(200) }))
  .handler(async ({ data }) => {
    const auth = await requireAdmin(data.password);
    if (!auth.ok) return { ok: false as const, reason: auth.reason };

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
