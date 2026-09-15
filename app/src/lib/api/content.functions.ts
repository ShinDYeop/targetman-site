import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { bindings } from "../bindings.server";
import type { Estimate, Ledger, Review, StockItem } from "../content";
import { SAMPLE_REVIEWS } from "../../data/reviews";
import { SAMPLE_STOCK } from "../../data/stock";
import { SAMPLE_ESTIMATES } from "../../data/estimates";
import { requireAdmin } from "./auth.server";
import { clean, cleanMultiline } from "./security.server";

type ReviewRow = {
  id: number; no: number; date: string; brand: string; model: string; contract: string;
  term: number; region: string; owner: string; customer: string; quote: string;
  reply: string; photo: string; published: number;
};

type StockRow = {
  id: number; code: string; status: string; brand: string; model: string; trim: string;
  year: number; color_ext: string; color_int: string; mileage_km: number; contract: string;
  avail_date: string; term_months: number; prepay_pct: number; deposit_pct: number;
  monthly_from: number; options: string; note: string; photo: string; sort_order: number;
};

function toStock(r: StockRow): StockItem {
  return {
    id: r.id, code: r.code, status: r.status, brand: r.brand, model: r.model, trim: r.trim,
    year: r.year, colorExt: r.color_ext, colorInt: r.color_int, mileageKm: r.mileage_km,
    contract: r.contract, availDate: r.avail_date, termMonths: r.term_months,
    prepayPct: r.prepay_pct, depositPct: r.deposit_pct, monthlyFrom: r.monthly_from,
    options: r.options, note: r.note, photo: r.photo, sortOrder: r.sort_order,
  };
}

type EstimateRow = {
  id: number; brand: string; model: string; trim: string; contract: string;
  term_months: number; monthly_from: number; quoted_at: string; body: string;
  photo: string; published: number; sort_order: number;
};

function toEstimate(r: EstimateRow): Estimate {
  return {
    id: r.id, brand: r.brand, model: r.model, trim: r.trim, contract: r.contract,
    termMonths: r.term_months, monthlyFrom: r.monthly_from, quotedAt: r.quoted_at,
    body: r.body, photo: r.photo, published: r.published, sortOrder: r.sort_order,
  };
}

const DEFAULT_LEDGER: Ledger = { total: 513, thisMonth: 12, updatedAt: "" };

async function readSettings(): Promise<Ledger> {
  const { DB } = bindings();
  if (!DB) return DEFAULT_LEDGER;
  try {
    const res = await DB.prepare("SELECT key, value FROM settings").all<{ key: string; value: string }>();
    const map = new Map((res.results ?? []).map((r) => [r.key, r.value]));
    return {
      total: Number(map.get("total") ?? DEFAULT_LEDGER.total) || DEFAULT_LEDGER.total,
      thisMonth: Number(map.get("thisMonth") ?? DEFAULT_LEDGER.thisMonth) || 0,
      updatedAt: map.get("updatedAt") ?? "",
    };
  } catch {
    return DEFAULT_LEDGER;
  }
}

/**
 * 공개 화면용 데이터. 아직 아무것도 입력하지 않았으면 예시를 보여주고
 * isSample 을 true 로 돌려줍니다. 첫 건을 등록하는 순간 예시는 사라집니다.
 */
export const loadSiteContent = createServerFn({ method: "GET" }).handler(async () => {
  const { DB } = bindings();
  const ledger = await readSettings();
  if (!DB) {
    return {
      reviews: SAMPLE_REVIEWS, stock: SAMPLE_STOCK, estimates: SAMPLE_ESTIMATES, ledger,
      reviewsAreSample: true, stockIsSample: true, estimatesAreSample: true,
    };
  }
  let reviews: Review[] = [];
  let stock: StockItem[] = [];
  let estimates: Estimate[] = [];
  try {
    const r = await DB.prepare(
      "SELECT * FROM reviews WHERE published = 1 ORDER BY no DESC, id DESC LIMIT 300",
    ).all<ReviewRow>();
    reviews = (r.results ?? []) as Review[];
  } catch { /* 테이블이 아직 없으면 예시로 */ }
  try {
    const s = await DB.prepare(
      "SELECT * FROM stock ORDER BY sort_order DESC, id DESC LIMIT 300",
    ).all<StockRow>();
    stock = (s.results ?? []).map(toStock);
  } catch { /* 테이블이 아직 없으면 예시로 */ }
  try {
    const e = await DB.prepare(
      "SELECT * FROM estimates WHERE published = 1 ORDER BY sort_order DESC, id DESC LIMIT 300",
    ).all<EstimateRow>();
    estimates = (e.results ?? []).map(toEstimate);
  } catch { /* 테이블이 아직 없으면 예시로 */ }

  return {
    reviews: reviews.length ? reviews : SAMPLE_REVIEWS,
    stock: stock.length ? stock : SAMPLE_STOCK,
    estimates: estimates.length ? estimates : SAMPLE_ESTIMATES,
    ledger,
    reviewsAreSample: reviews.length === 0,
    stockIsSample: stock.length === 0,
    estimatesAreSample: estimates.length === 0,
  };
});

/* ------------------------------ 관리자 ------------------------------ */

const Pw = z.object({ password: z.string().min(1).max(200) });

export const adminLoad = createServerFn({ method: "POST" })
  .inputValidator(Pw)
  .handler(async ({ data }) => {
    const auth = await requireAdmin(data.password);
    if (!auth.ok) return { ok: false as const, reason: auth.reason };
    const { DB } = bindings();
    if (!DB) return { ok: false as const, reason: "storage_unavailable" };

    const r = await DB.prepare("SELECT * FROM reviews ORDER BY no DESC, id DESC LIMIT 500").all<ReviewRow>();
    const s = await DB.prepare("SELECT * FROM stock ORDER BY sort_order DESC, id DESC LIMIT 500").all<StockRow>();
    const e = await DB.prepare(
      "SELECT * FROM estimates ORDER BY sort_order DESC, id DESC LIMIT 500",
    ).all<EstimateRow>();
    return {
      ok: true as const,
      reviews: (r.results ?? []) as Review[],
      stock: (s.results ?? []).map(toStock),
      estimates: (e.results ?? []).map(toEstimate),
      ledger: await readSettings(),
    };
  });

const ReviewInput = Pw.extend({
  id: z.number().default(0),
  no: z.number().default(0),
  date: z.string().max(20).default(""),
  brand: z.string().max(30).default(""),
  model: z.string().max(60).default(""),
  contract: z.string().max(20).default("리스"),
  term: z.number().default(48),
  region: z.string().max(30).default(""),
  owner: z.string().max(20).default("개인"),
  customer: z.string().max(40).default(""),
  quote: z.string().max(2000).default(""),
  reply: z.string().max(2000).default(""),
  photo: z.string().max(3000).default(""),
  published: z.number().default(1),
});

export const saveReview = createServerFn({ method: "POST" })
  .inputValidator(ReviewInput)
  .handler(async ({ data }) => {
    const auth = await requireAdmin(data.password);
    if (!auth.ok) return { ok: false as const, reason: auth.reason };
    const { DB } = bindings();
    if (!DB) return { ok: false as const, reason: "storage_unavailable" };

    const v = [
      Math.max(0, Math.floor(data.no)), clean(data.date, 20), clean(data.brand, 30),
      clean(data.model, 60), clean(data.contract, 20), Math.max(0, Math.floor(data.term)),
      clean(data.region, 30), clean(data.owner, 20), clean(data.customer, 40),
      cleanMultiline(data.quote, 2000), cleanMultiline(data.reply, 2000),
      clean(data.photo, 3000), data.published ? 1 : 0,
    ];

    if (data.id > 0) {
      await DB.prepare(
        `UPDATE reviews SET no=?, date=?, brand=?, model=?, contract=?, term=?, region=?,
           owner=?, customer=?, quote=?, reply=?, photo=?, published=? WHERE id=?`,
      ).bind(...v, data.id).run();
      return { ok: true as const, id: data.id };
    }
    const res = await DB.prepare(
      `INSERT INTO reviews (no, date, brand, model, contract, term, region, owner,
         customer, quote, reply, photo, published, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    ).bind(...v, new Date().toISOString()).run();
    return { ok: true as const, id: Number(res.meta?.last_row_id ?? 0) };
  });

const StockInput = Pw.extend({
  id: z.number().default(0),
  code: z.string().max(40).default(""),
  status: z.string().max(20).default("판매중"),
  brand: z.string().max(30).default(""),
  model: z.string().max(60).default(""),
  trim: z.string().max(60).default(""),
  year: z.number().default(0),
  colorExt: z.string().max(40).default(""),
  colorInt: z.string().max(40).default(""),
  mileageKm: z.number().default(0),
  contract: z.string().max(30).default("리스 · 장기렌트"),
  availDate: z.string().max(30).default("즉시"),
  termMonths: z.number().default(48),
  prepayPct: z.number().default(0),
  depositPct: z.number().default(0),
  monthlyFrom: z.number().default(0),
  options: z.string().max(400).default(""),
  note: z.string().max(600).default(""),
  photo: z.string().max(3000).default(""),
  sortOrder: z.number().default(0),
});

export const saveStock = createServerFn({ method: "POST" })
  .inputValidator(StockInput)
  .handler(async ({ data }) => {
    const auth = await requireAdmin(data.password);
    if (!auth.ok) return { ok: false as const, reason: auth.reason };
    const { DB } = bindings();
    if (!DB) return { ok: false as const, reason: "storage_unavailable" };

    const v = [
      clean(data.code, 40), clean(data.status, 20), clean(data.brand, 30), clean(data.model, 60),
      clean(data.trim, 60), Math.max(0, Math.floor(data.year)), clean(data.colorExt, 40),
      clean(data.colorInt, 40), Math.max(0, Math.floor(data.mileageKm)), clean(data.contract, 30),
      clean(data.availDate, 30), Math.max(0, Math.floor(data.termMonths)),
      Math.max(0, Math.floor(data.prepayPct)), Math.max(0, Math.floor(data.depositPct)),
      Math.max(0, Math.floor(data.monthlyFrom)), clean(data.options, 400),
      cleanMultiline(data.note, 600), clean(data.photo, 3000), Math.floor(data.sortOrder),
    ];

    if (data.id > 0) {
      await DB.prepare(
        `UPDATE stock SET code=?, status=?, brand=?, model=?, trim=?, year=?, color_ext=?,
           color_int=?, mileage_km=?, contract=?, avail_date=?, term_months=?, prepay_pct=?,
           deposit_pct=?, monthly_from=?, options=?, note=?, photo=?, sort_order=?, updated_at=?
         WHERE id=?`,
      ).bind(...v, new Date().toISOString(), data.id).run();
      return { ok: true as const, id: data.id };
    }
    const res = await DB.prepare(
      `INSERT INTO stock (code, status, brand, model, trim, year, color_ext, color_int,
         mileage_km, contract, avail_date, term_months, prepay_pct, deposit_pct, monthly_from,
         options, note, photo, sort_order, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    ).bind(...v, new Date().toISOString()).run();
    return { ok: true as const, id: Number(res.meta?.last_row_id ?? 0) };
  });

const EstimateInput = Pw.extend({
  id: z.number().default(0),
  brand: z.string().max(30).default(""),
  model: z.string().max(60).default(""),
  trim: z.string().max(60).default(""),
  contract: z.string().max(20).default("리스"),
  termMonths: z.number().default(48),
  monthlyFrom: z.number().default(0),
  quotedAt: z.string().max(20).default(""),
  body: z.string().max(4000).default(""),
  photo: z.string().max(3000).default(""),
  published: z.number().default(1),
  sortOrder: z.number().default(0),
});

export const saveEstimate = createServerFn({ method: "POST" })
  .inputValidator(EstimateInput)
  .handler(async ({ data }) => {
    const auth = await requireAdmin(data.password);
    if (!auth.ok) return { ok: false as const, reason: auth.reason };
    const { DB } = bindings();
    if (!DB) return { ok: false as const, reason: "storage_unavailable" };

    const v = [
      clean(data.brand, 30), clean(data.model, 60), clean(data.trim, 60),
      clean(data.contract, 20), Math.max(0, Math.floor(data.termMonths)),
      Math.max(0, Math.floor(data.monthlyFrom)), clean(data.quotedAt, 20),
      cleanMultiline(data.body, 4000), clean(data.photo, 3000),
      data.published ? 1 : 0, Math.floor(data.sortOrder),
    ];

    if (data.id > 0) {
      await DB.prepare(
        `UPDATE estimates SET brand=?, model=?, trim=?, contract=?, term_months=?,
           monthly_from=?, quoted_at=?, body=?, photo=?, published=?, sort_order=?, updated_at=?
         WHERE id=?`,
      ).bind(...v, new Date().toISOString(), data.id).run();
      return { ok: true as const, id: data.id };
    }
    const res = await DB.prepare(
      `INSERT INTO estimates (brand, model, trim, contract, term_months, monthly_from,
         quoted_at, body, photo, published, sort_order, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    ).bind(...v, new Date().toISOString(), new Date().toISOString()).run();
    return { ok: true as const, id: Number(res.meta?.last_row_id ?? 0) };
  });

export const deleteRow = createServerFn({ method: "POST" })
  .inputValidator(
    Pw.extend({
      table: z.enum(["reviews", "stock", "estimates", "quote_requests"]),
      id: z.number(),
    }),
  )
  .handler(async ({ data }) => {
    const auth = await requireAdmin(data.password);
    if (!auth.ok) return { ok: false as const, reason: auth.reason };
    const { DB } = bindings();
    if (!DB) return { ok: false as const, reason: "storage_unavailable" };
    const TABLES = {
      reviews: "DELETE FROM reviews WHERE id = ?",
      stock: "DELETE FROM stock WHERE id = ?",
      estimates: "DELETE FROM estimates WHERE id = ?",
      quote_requests: "DELETE FROM quote_requests WHERE id = ?",
    } as const;
    const sql = TABLES[data.table];
    await DB.prepare(sql).bind(Math.floor(data.id)).run();
    return { ok: true as const };
  });

export const saveLedger = createServerFn({ method: "POST" })
  .inputValidator(Pw.extend({ total: z.number(), thisMonth: z.number(), updatedAt: z.string().max(40) }))
  .handler(async ({ data }) => {
    const auth = await requireAdmin(data.password);
    if (!auth.ok) return { ok: false as const, reason: auth.reason };
    const { DB } = bindings();
    if (!DB) return { ok: false as const, reason: "storage_unavailable" };
    const pairs: Array<[string, string]> = [
      ["total", String(Math.max(0, Math.floor(data.total)))],
      ["thisMonth", String(Math.max(0, Math.floor(data.thisMonth)))],
      ["updatedAt", clean(data.updatedAt, 40)],
    ];
    for (const [k, val] of pairs) {
      await DB.prepare(
        "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      ).bind(k, val).run();
    }
    return { ok: true as const };
  });
