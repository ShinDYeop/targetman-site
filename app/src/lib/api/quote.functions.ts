import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { bindings } from "../bindings.server";

const QuoteInput = z.object({
  brand: z.string().max(60).default(""),
  model: z.string().max(80).default(""),
  contractType: z.string().max(30).default(""),
  termMonths: z.string().max(20).default(""),
  annualKm: z.string().max(30).default(""),
  ownerType: z.string().max(30).default(""),
  budget: z.string().max(40).default(""),
  timing: z.string().max(40).default(""),
  name: z.string().min(1).max(40),
  phone: z.string().min(6).max(40),
  callWindow: z.string().max(40).default(""),
  memo: z.string().max(1000).default(""),
  src: z.string().max(80).default(""),
  marketingOptin: z.boolean().default(false),
});

export const submitQuote = createServerFn({ method: "POST" })
  .inputValidator(QuoteInput)
  .handler(async ({ data }) => {
    const { DB } = bindings();
    if (!DB) {
      return { ok: false as const, reason: "storage_unavailable" };
    }
    await DB.prepare(
      `INSERT INTO quote_requests
        (created_at, brand, model, contract_type, term_months, annual_km,
         owner_type, budget, timing, name, phone, call_window, memo, src, marketing_optin)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
      .bind(
        new Date().toISOString(),
        data.brand,
        data.model,
        data.contractType,
        data.termMonths,
        data.annualKm,
        data.ownerType,
        data.budget,
        data.timing,
        data.name,
        data.phone,
        data.callWindow,
        data.memo,
        data.src,
        data.marketingOptin ? 1 : 0,
      )
      .run();
    return { ok: true as const };
  });
