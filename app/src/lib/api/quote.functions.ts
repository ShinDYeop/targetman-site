import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { bindings } from "../bindings.server";
import { notifyOwner, formatNotification } from "./notify.server";
import {
  clean,
  cleanMultiline,
  guardSubmission,
  purgeExpired,
  recordSubmission,
} from "./security.server";

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
  hp: z.string().max(200).default(""),
  elapsedMs: z.number().default(0),
});

export const submitQuote = createServerFn({ method: "POST" })
  .inputValidator(QuoteInput)
  .handler(async ({ data }) => {
    const name = clean(data.name, 40);
    const phone = clean(data.phone, 40);
    const memo = cleanMultiline(data.memo, 1000);
    if (!name) return { ok: false as const, reason: "invalid" };

    const guard = await guardSubmission({
      phone,
      honeypot: data.hp,
      elapsedMs: data.elapsedMs,
    });
    if (!guard.ok) return { ok: false as const, reason: guard.reason };

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
        name,
        phone,
        clean(data.callWindow, 40),
        memo,
        clean(data.src, 80),
        data.marketingOptin ? 1 : 0,
      )
      .run();

    await recordSubmission(phone);
    await purgeExpired();

    await notifyOwner(
      `[견적] ${name} 님 (${phone})`,
      formatNotification({
        kind: "견적",
        name,
        phone,
        brand: data.brand,
        model: data.model,
        contractType: data.contractType,
        budget: data.budget,
        timing: data.timing,
        callWindow: clean(data.callWindow, 40),
        memo,
      }),
    );

    return { ok: true as const };
  });
