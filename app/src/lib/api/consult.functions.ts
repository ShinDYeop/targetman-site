import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { bindings } from "../bindings.server";
import { notifyOwner, formatNotification } from "./notify.server";

const ConsultInput = z.object({
  name: z.string().min(1).max(40),
  phone: z.string().min(6).max(40),
  callWindow: z.string().max(40).default(""),
  memo: z.string().min(1).max(2000),
  src: z.string().max(80).default("consult"),
  marketingOptin: z.boolean().default(false),
});

export const submitConsult = createServerFn({ method: "POST" })
  .inputValidator(ConsultInput)
  .handler(async ({ data }) => {
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
        data.name,
        data.phone,
        data.callWindow,
        data.memo,
        data.src,
        data.marketingOptin ? 1 : 0,
      )
      .run();

    await notifyOwner(
      `[상담] ${data.name} 님 (${data.phone})`,
      formatNotification({
        kind: "상담",
        name: data.name,
        phone: data.phone,
        callWindow: data.callWindow,
        memo: data.memo,
      }),
    );

    return { ok: true as const };
  });
