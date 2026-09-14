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

const ConsultInput = z.object({
  name: z.string().min(1).max(40),
  phone: z.string().min(6).max(40),
  callWindow: z.string().max(40).default(""),
  memo: z.string().min(1).max(2000),
  src: z.string().max(80).default("consult"),
  marketingOptin: z.boolean().default(false),
  hp: z.string().max(200).default(""),
  elapsedMs: z.number().default(0),
});

export const submitConsult = createServerFn({ method: "POST" })
  .inputValidator(ConsultInput)
  .handler(async ({ data }) => {
    const name = clean(data.name, 40);
    const phone = clean(data.phone, 40);
    const memo = cleanMultiline(data.memo, 2000);
    const callWindow = clean(data.callWindow, 40);
    if (!name || !memo) return { ok: false as const, reason: "invalid" };

    const guard = await guardSubmission({
      phone,
      honeypot: data.hp,
      elapsedMs: data.elapsedMs,
    });
    if (!guard.ok) return { ok: false as const, reason: guard.reason };

    const { DB } = bindings();
    if (!DB) return { ok: false as const, reason: "storage_unavailable" };

    await DB.prepare(
      `INSERT INTO quote_requests
        (created_at, brand, model, contract_type, term_months, annual_km,
         owner_type, budget, timing, name, phone, call_window, memo, src, marketing_optin)
       VALUES (?,'','','','','','','','',?,?,?,?,?,?)`,
    )
      .bind(
        new Date().toISOString(),
        name,
        phone,
        callWindow,
        memo,
        clean(data.src, 80),
        data.marketingOptin ? 1 : 0,
      )
      .run();

    await recordSubmission(phone);
    await purgeExpired();

    await notifyOwner(
      `[상담] ${name} 님 (${phone})`,
      formatNotification({ kind: "상담", name, phone, callWindow, memo }),
    );

    return { ok: true as const };
  });
