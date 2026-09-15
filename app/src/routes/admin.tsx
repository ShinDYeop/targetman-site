import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { listRequests, type RequestRow } from "../lib/api/admin.functions";
import {
  adminLoad,
  deleteRow,
  saveEstimate,
  saveLedger,
  saveReview,
  saveStock,
} from "../lib/api/content.functions";
import {
  EMPTY_ESTIMATE,
  EMPTY_REVIEW,
  EMPTY_STOCK,
  type Estimate,
  type Ledger,
  type Review,
  type StockItem,
} from "../lib/content";
import { MultiPhotoPicker } from "../components/admin/photos";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "관리자" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: Admin,
});

type Tab = "inbox" | "reviews" | "estimates" | "stock" | "settings";

function when(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${kst.getUTCFullYear()}.${p(kst.getUTCMonth() + 1)}.${p(kst.getUTCDate())} ${p(kst.getUTCHours())}:${p(kst.getUTCMinutes())}`;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="t-field">
      <label>{label}</label>
      {children}
    </div>
  );
}

function Admin() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>("inbox");
  const [state, setState] = useState<"idle" | "loading" | "bad" | "error">("idle");
  const [msg, setMsg] = useState("");

  const [rows, setRows] = useState<RequestRow[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [ledger, setLedger] = useState<Ledger>({ total: 0, thisMonth: 0, updatedAt: "" });

  const [editReview, setEditReview] = useState<Review | null>(null);
  const [editStock, setEditStock] = useState<StockItem | null>(null);
  const [editEstimate, setEditEstimate] = useState<Estimate | null>(null);

  async function loadAll(pw: string) {
    setState("loading");
    try {
      const [inbox, content] = await Promise.all([
        listRequests({ data: { password: pw } }),
        adminLoad({ data: { password: pw } }),
      ]);
      if (!inbox.ok || !content.ok) {
        setState("bad");
        return;
      }
      setRows(inbox.rows);
      setReviews(content.reviews);
      setStock(content.stock);
      setEstimates(content.estimates);
      setLedger(content.ledger);
      setAuthed(true);
      setState("idle");
    } catch {
      setState("error");
    }
  }

  async function refresh() {
    await loadAll(password);
  }

  function flash(text: string) {
    setMsg(text);
    setTimeout(() => setMsg(""), 2500);
  }

  if (!authed) {
    return (
      <div className="t-wrap" style={{ maxWidth: 380, paddingBlock: 80 }}>
        <div className="t-eyebrow">Admin</div>
        <h1 style={{ fontSize: 22, marginTop: 8 }}>관리자</h1>
        <form
          className="t-form"
          style={{ marginTop: 18 }}
          onSubmit={(e) => {
            e.preventDefault();
            void loadAll(password);
          }}
        >
          <Field label="비밀번호">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </Field>
          <button className="t-cta-submit" type="submit" disabled={state === "loading"}>
            {state === "loading" ? "확인 중" : "열기"}
          </button>
          {state === "bad" ? (
            <p className="t-small" style={{ marginTop: 10, color: "var(--t-notice)" }}>
              비밀번호가 맞지 않습니다.
            </p>
          ) : null}
          {state === "error" ? (
            <p className="t-small" style={{ marginTop: 10, color: "var(--t-notice)" }}>
              불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
            </p>
          ) : null}
        </form>
      </div>
    );
  }

  const TABS: Array<[Tab, string, number]> = [
    ["inbox", "접수함", rows.length],
    ["reviews", "후기", reviews.length],
    ["estimates", "차량별 견적", estimates.length],
    ["stock", "재고(숨김)", stock.length],
    ["settings", "설정", 0],
  ];

  return (
    <div className="t-wrap" style={{ paddingBlock: 26, maxWidth: 760 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 22 }}>관리자</h1>
        <button type="button" className="t-cta-text" onClick={() => void refresh()}>
          새로고침
        </button>
        {msg ? (
          <span className="t-small" style={{ color: "var(--t-good)", fontWeight: 600 }}>
            {msg}
          </span>
        ) : null}
      </div>

      <nav className="t-nav" style={{ marginTop: 14 }}>
        {TABS.map(([key, label, count]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            data-on={tab === key ? "1" : undefined}
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              padding: "6px 12px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              background: tab === key ? "var(--t-ink)" : "var(--t-surface-2)",
              color: tab === key ? "#fff" : "var(--t-ink-2)",
            }}
          >
            {label}
            {count ? ` ${count}` : ""}
          </button>
        ))}
      </nav>

      {tab === "inbox" ? (
        <section style={{ marginTop: 18 }}>
          <p className="t-small">
            최신순 최대 300건. 이 화면에는 고객 개인정보가 있습니다. 공용 PC나 화면 공유
            중에는 열지 마세요.
          </p>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            {rows.map((r) => (
              <article className="t-card" key={r.id}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <span className="t-badge" data-k="now">견적</span>
                  <strong style={{ fontSize: 15 }}>{r.name}</strong>
                  <a
                    className="t-mono"
                    href={`tel:${r.phone.replace(/[^0-9+]/g, "")}`}
                    style={{ color: "var(--t-accent)", fontSize: 14, fontWeight: 600 }}
                  >
                    {r.phone}
                  </a>
                  <span className="t-rev-meta t-mono" style={{ marginLeft: "auto" }}>
                    {when(r.created_at)}
                  </span>
                  <button
                    type="button"
                    className="t-cta-text"
                    style={{ color: "var(--t-notice)" }}
                    onClick={async () => {
                      if (!window.confirm(`${r.name} 님의 요청을 지울까요? 되돌릴 수 없습니다.`)) return;
                      await deleteRow({ data: { password, table: "quote_requests", id: r.id } });
                      flash("삭제했습니다.");
                      await refresh();
                    }}
                  >
                    삭제
                  </button>
                </div>
                <dl className="t-spec" style={{ marginTop: 10 }}>
                  {r.brand || r.model ? (
                    <div>
                      <dt>차종</dt>
                      <dd>{[r.brand, r.model].filter(Boolean).join(" ")}</dd>
                    </div>
                  ) : null}
                  {r.contract_type ? (
                    <div>
                      <dt>계약형태</dt>
                      <dd>{[r.contract_type, r.term_months].filter(Boolean).join(" · ")}</dd>
                    </div>
                  ) : null}
                  {r.owner_type ? (
                    <div>
                      <dt>명의</dt>
                      <dd>{r.owner_type}</dd>
                    </div>
                  ) : null}
                  {r.budget ? (
                    <div>
                      <dt>예산</dt>
                      <dd>{r.budget}</dd>
                    </div>
                  ) : null}
                  {r.timing ? (
                    <div>
                      <dt>인수 시기</dt>
                      <dd>{r.timing}</dd>
                    </div>
                  ) : null}
                  {r.call_window ? (
                    <div>
                      <dt>연락 시간</dt>
                      <dd>{r.call_window}</dd>
                    </div>
                  ) : null}
                </dl>
                {r.memo ? (
                  <p
                    style={{
                      marginTop: 10,
                      whiteSpace: "pre-wrap",
                      fontSize: 13,
                      lineHeight: 1.7,
                      color: "var(--t-ink-2)",
                      borderLeft: "3px solid var(--t-accent)",
                      background: "var(--t-surface-2)",
                      borderRadius: 8,
                      padding: "10px 12px",
                    }}
                  >
                    {r.memo}
                  </p>
                ) : null}
              </article>
            ))}
            {rows.length === 0 ? <p className="t-note">아직 접수된 요청이 없습니다.</p> : null}
          </div>
        </section>
      ) : null}

      {tab === "reviews" ? (
        <section style={{ marginTop: 18 }}>
          {editReview ? (
            <form
              className="t-form"
              onSubmit={async (e) => {
                e.preventDefault();
                const res = await saveReview({ data: { password, ...editReview } });
                if (res.ok) {
                  setEditReview(null);
                  flash("저장했습니다.");
                  await refresh();
                } else {
                  flash("저장하지 못했습니다.");
                }
              }}
            >
              <h2 style={{ fontSize: 16, marginBottom: 12 }}>
                {editReview.id > 0 ? "후기 수정" : "새 후기"}
              </h2>
              <MultiPhotoPicker
                label="출고 사진"
                value={editReview.photo}
                password={password}
                onChange={(photo) => setEditReview({ ...editReview, photo })}
                hint="여러 장 한 번에 고를 수 있습니다. 올린 뒤 편집을 눌러 번호판과 얼굴을 모자이크하세요. 맨 앞 사진이 목록에 대표로 나옵니다."
              />
              <div className="t-fieldrow">
                <Field label="출고 번호">
                  <input
                    type="number"
                    value={editReview.no}
                    onChange={(e) => setEditReview({ ...editReview, no: Number(e.target.value) })}
                  />
                </Field>
                <Field label="출고일">
                  <input
                    value={editReview.date}
                    placeholder="2026.09.14"
                    onChange={(e) => setEditReview({ ...editReview, date: e.target.value })}
                  />
                </Field>
              </div>
              <div className="t-fieldrow">
                <Field label="브랜드">
                  <input
                    value={editReview.brand}
                    placeholder="벤츠"
                    onChange={(e) => setEditReview({ ...editReview, brand: e.target.value })}
                  />
                </Field>
                <Field label="모델">
                  <input
                    value={editReview.model}
                    placeholder="E250 AMG Line"
                    onChange={(e) => setEditReview({ ...editReview, model: e.target.value })}
                  />
                </Field>
              </div>
              <div className="t-fieldrow">
                <Field label="계약 형태">
                  <select
                    value={editReview.contract}
                    onChange={(e) => setEditReview({ ...editReview, contract: e.target.value })}
                  >
                    <option>리스</option>
                    <option>장기렌트</option>
                  </select>
                </Field>
                <Field label="계약 기간(개월)">
                  <input
                    type="number"
                    value={editReview.term}
                    onChange={(e) => setEditReview({ ...editReview, term: Number(e.target.value) })}
                  />
                </Field>
              </div>
              <div className="t-fieldrow">
                <Field label="명의">
                  <select
                    value={editReview.owner}
                    onChange={(e) => setEditReview({ ...editReview, owner: e.target.value })}
                  >
                    <option>개인</option>
                    <option>개인사업자</option>
                    <option>법인</option>
                  </select>
                </Field>
                <Field label="지역">
                  <input
                    value={editReview.region}
                    placeholder="경기 남양주"
                    onChange={(e) => setEditReview({ ...editReview, region: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="고객 표기">
                <input
                  value={editReview.customer}
                  placeholder="김○○ 님"
                  onChange={(e) => setEditReview({ ...editReview, customer: e.target.value })}
                />
              </Field>
              <Field label="후기 원문 (고치지 마세요)">
                <textarea
                  value={editReview.quote}
                  onChange={(e) => setEditReview({ ...editReview, quote: e.target.value })}
                />
              </Field>
              <Field label="담당자 답글">
                <textarea
                  value={editReview.reply}
                  onChange={(e) => setEditReview({ ...editReview, reply: e.target.value })}
                />
              </Field>
              <div className="t-consent">
                <label>
                  <input
                    type="checkbox"
                    checked={editReview.published === 1}
                    onChange={(e) =>
                      setEditReview({ ...editReview, published: e.target.checked ? 1 : 0 })
                    }
                  />
                  <span>
                    <b>사이트에 공개</b> 고객 게시 동의를 받은 건만 체크하세요.
                  </span>
                </label>
              </div>
              <button className="t-cta-submit" type="submit">저장</button>
              <button
                type="button"
                className="t-cta-text"
                style={{ marginTop: 10 }}
                onClick={() => setEditReview(null)}
              >
                취소
              </button>
            </form>
          ) : (
            <>
              <button
                type="button"
                className="t-cta-plate"
                onClick={() => setEditReview({ id: 0, ...EMPTY_REVIEW })}
              >
                새 후기 등록
              </button>
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                {reviews.map((r) => (
                  <div className="t-card" key={r.id}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <strong style={{ fontSize: 14.5 }}>
                        No.{r.no} {r.brand} {r.model}
                      </strong>
                      <span className="t-rev-meta">{r.date}</span>
                      {r.published ? null : (
                        <span className="t-badge" data-k="done">비공개</span>
                      )}
                      <span style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
                        <button type="button" className="t-cta-text" onClick={() => setEditReview(r)}>
                          수정
                        </button>
                        <button
                          type="button"
                          className="t-cta-text"
                          style={{ color: "var(--t-notice)" }}
                          onClick={async () => {
                            await deleteRow({ data: { password, table: "reviews", id: r.id } });
                            flash("삭제했습니다.");
                            await refresh();
                          }}
                        >
                          삭제
                        </button>
                      </span>
                    </div>
                  </div>
                ))}
                {reviews.length === 0 ? (
                  <p className="t-note">
                    아직 등록한 후기가 없어 사이트에는 예시가 보입니다. 첫 건을 등록하면 예시는
                    사라집니다.
                  </p>
                ) : null}
              </div>
            </>
          )}
        </section>
      ) : null}

      {tab === "estimates" ? (
        <section style={{ marginTop: 18 }}>
          {editEstimate ? (
            <form
              className="t-form"
              onSubmit={async (e) => {
                e.preventDefault();
                const res = await saveEstimate({ data: { password, ...editEstimate } });
                if (res.ok) {
                  setEditEstimate(null);
                  flash("저장했습니다.");
                  await refresh();
                } else {
                  flash("저장하지 못했습니다.");
                }
              }}
            >
              <h2 style={{ fontSize: 16, marginBottom: 12 }}>
                {editEstimate.id > 0 ? "견적 수정" : "새 견적"}
              </h2>
              <MultiPhotoPicker
                label="견적표 사진"
                value={editEstimate.photo}
                password={password}
                onChange={(photo) => setEditEstimate({ ...editEstimate, photo })}
                hint="카톡 견적표를 캡처해서 그대로 올리시면 됩니다. 올린 뒤 반드시 편집을 눌러 고객명과 연락처를 모자이크하세요."
              />
              <div className="t-fieldrow">
                <Field label="브랜드">
                  <input
                    value={editEstimate.brand}
                    placeholder="벤츠"
                    onChange={(e) => setEditEstimate({ ...editEstimate, brand: e.target.value })}
                  />
                </Field>
                <Field label="모델">
                  <input
                    value={editEstimate.model}
                    placeholder="E250"
                    onChange={(e) => setEditEstimate({ ...editEstimate, model: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="트림 또는 사양">
                <input
                  value={editEstimate.trim}
                  placeholder="AMG Line"
                  onChange={(e) => setEditEstimate({ ...editEstimate, trim: e.target.value })}
                />
              </Field>
              <div className="t-fieldrow">
                <Field label="계약 형태">
                  <select
                    value={editEstimate.contract}
                    onChange={(e) => setEditEstimate({ ...editEstimate, contract: e.target.value })}
                  >
                    <option>리스</option>
                    <option>장기렌트</option>
                  </select>
                </Field>
                <Field label="계약 기간(개월)">
                  <input
                    type="number"
                    value={editEstimate.termMonths}
                    onChange={(e) =>
                      setEditEstimate({ ...editEstimate, termMonths: Number(e.target.value) })
                    }
                  />
                </Field>
              </div>
              <div className="t-fieldrow">
                <Field label="월 납입금(원)">
                  <input
                    type="number"
                    value={editEstimate.monthlyFrom}
                    onChange={(e) =>
                      setEditEstimate({ ...editEstimate, monthlyFrom: Number(e.target.value) })
                    }
                  />
                </Field>
                <Field label="산출일">
                  <input
                    value={editEstimate.quotedAt}
                    placeholder="2026.09.15"
                    onChange={(e) => setEditEstimate({ ...editEstimate, quotedAt: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="설명 (조건과 주의사항)">
                <textarea
                  rows={8}
                  value={editEstimate.body}
                  onChange={(e) => setEditEstimate({ ...editEstimate, body: e.target.value })}
                />
              </Field>
              <p className="t-small" style={{ marginBottom: 12 }}>
                줄바꿈은 그대로 나옵니다. 어떤 조건에서 뽑은 금액인지, 조건을 바꾸면 얼마가
                되는지까지 적어 두시면 카톡 문의가 눈에 띄게 줄어듭니다.
              </p>
              <Field label="정렬 순서 (클수록 위)">
                <input
                  type="number"
                  value={editEstimate.sortOrder}
                  onChange={(e) =>
                    setEditEstimate({ ...editEstimate, sortOrder: Number(e.target.value) })
                  }
                />
              </Field>
              <div className="t-consent">
                <label>
                  <input
                    type="checkbox"
                    checked={editEstimate.published === 1}
                    onChange={(e) =>
                      setEditEstimate({ ...editEstimate, published: e.target.checked ? 1 : 0 })
                    }
                  />
                  <span>
                    <b>사이트에 공개</b> 사진에서 고객명과 연락처를 가렸는지 먼저 확인하세요.
                  </span>
                </label>
              </div>
              <button className="t-cta-submit" type="submit">저장</button>
              <button
                type="button"
                className="t-cta-text"
                style={{ marginTop: 10 }}
                onClick={() => setEditEstimate(null)}
              >
                취소
              </button>
            </form>
          ) : (
            <>
              <button
                type="button"
                className="t-cta-plate"
                onClick={() =>
                  setEditEstimate({
                    id: 0,
                    ...EMPTY_ESTIMATE,
                    sortOrder: (estimates[0]?.sortOrder ?? 0) + 10,
                  })
                }
              >
                새 견적 등록
              </button>
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                {estimates.map((e) => (
                  <div className="t-card" key={e.id}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <strong style={{ fontSize: 14.5 }}>
                        {e.brand} {e.model}
                      </strong>
                      <span className="t-rev-meta">
                        {[e.contract, e.termMonths ? `${e.termMonths}개월` : "", e.quotedAt]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                      {e.published ? null : (
                        <span className="t-badge" data-k="done">비공개</span>
                      )}
                      <span style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
                        <button
                          type="button"
                          className="t-cta-text"
                          onClick={() => setEditEstimate(e)}
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          className="t-cta-text"
                          style={{ color: "var(--t-notice)" }}
                          onClick={async () => {
                            if (!window.confirm("이 견적을 지울까요? 되돌릴 수 없습니다.")) return;
                            await deleteRow({ data: { password, table: "estimates", id: e.id } });
                            flash("삭제했습니다.");
                            await refresh();
                          }}
                        >
                          삭제
                        </button>
                      </span>
                    </div>
                  </div>
                ))}
                {estimates.length === 0 ? (
                  <p className="t-note">
                    아직 등록한 견적이 없어 사이트에는 예시가 보입니다. 첫 건을 등록하면 예시는
                    사라집니다.
                  </p>
                ) : null}
              </div>
            </>
          )}
        </section>
      ) : null}

      {tab === "stock" ? (
        <section style={{ marginTop: 18 }}>
          <p className="t-note" style={{ marginBottom: 12 }}>
            즉시출고 재고는 메뉴에서 내렸습니다. 페이지 자체는 /stock 주소로 살아 있으니 나중에
            다시 쓰실 수 있고, 지금은 아무 데서도 링크되지 않습니다.
          </p>
          {editStock ? (
            <form
              className="t-form"
              onSubmit={async (e) => {
                e.preventDefault();
                const res = await saveStock({ data: { password, ...editStock } });
                if (res.ok) {
                  setEditStock(null);
                  flash("저장했습니다.");
                  await refresh();
                } else {
                  flash("저장하지 못했습니다.");
                }
              }}
            >
              <h2 style={{ fontSize: 16, marginBottom: 12 }}>
                {editStock.id > 0 ? "재고 수정" : "새 재고"}
              </h2>
              <MultiPhotoPicker
                label="차량 사진"
                value={editStock.photo}
                password={password}
                onChange={(photo) => setEditStock({ ...editStock, photo })}
              />
              <div className="t-fieldrow">
                <Field label="재고 코드">
                  <input
                    value={editStock.code}
                    placeholder="ST-2609-001"
                    onChange={(e) => setEditStock({ ...editStock, code: e.target.value })}
                  />
                </Field>
                <Field label="상태">
                  <select
                    value={editStock.status}
                    onChange={(e) => setEditStock({ ...editStock, status: e.target.value })}
                  >
                    <option>판매중</option>
                    <option>상담중</option>
                    <option>계약완료</option>
                  </select>
                </Field>
              </div>
              <div className="t-fieldrow">
                <Field label="브랜드">
                  <input
                    value={editStock.brand}
                    onChange={(e) => setEditStock({ ...editStock, brand: e.target.value })}
                  />
                </Field>
                <Field label="모델">
                  <input
                    value={editStock.model}
                    onChange={(e) => setEditStock({ ...editStock, model: e.target.value })}
                  />
                </Field>
              </div>
              <div className="t-fieldrow">
                <Field label="트림">
                  <input
                    value={editStock.trim}
                    onChange={(e) => setEditStock({ ...editStock, trim: e.target.value })}
                  />
                </Field>
                <Field label="연식">
                  <input
                    type="number"
                    value={editStock.year}
                    onChange={(e) => setEditStock({ ...editStock, year: Number(e.target.value) })}
                  />
                </Field>
              </div>
              <div className="t-fieldrow">
                <Field label="외장색">
                  <input
                    value={editStock.colorExt}
                    onChange={(e) => setEditStock({ ...editStock, colorExt: e.target.value })}
                  />
                </Field>
                <Field label="내장색">
                  <input
                    value={editStock.colorInt}
                    onChange={(e) => setEditStock({ ...editStock, colorInt: e.target.value })}
                  />
                </Field>
              </div>
              <div className="t-fieldrow">
                <Field label="주행거리(km)">
                  <input
                    type="number"
                    value={editStock.mileageKm}
                    onChange={(e) => setEditStock({ ...editStock, mileageKm: Number(e.target.value) })}
                  />
                </Field>
                <Field label="출고 가능일">
                  <input
                    value={editStock.availDate}
                    placeholder="즉시 또는 2026-10-05"
                    onChange={(e) => setEditStock({ ...editStock, availDate: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="계약 형태">
                <select
                  value={editStock.contract}
                  onChange={(e) => setEditStock({ ...editStock, contract: e.target.value })}
                >
                  <option>리스 · 장기렌트</option>
                  <option>리스</option>
                  <option>장기렌트</option>
                </select>
              </Field>
              <div className="t-fieldrow">
                <Field label="계약기간(개월)">
                  <input
                    type="number"
                    value={editStock.termMonths}
                    onChange={(e) => setEditStock({ ...editStock, termMonths: Number(e.target.value) })}
                  />
                </Field>
                <Field label="월 납입 시작가(원)">
                  <input
                    type="number"
                    value={editStock.monthlyFrom}
                    onChange={(e) => setEditStock({ ...editStock, monthlyFrom: Number(e.target.value) })}
                  />
                </Field>
              </div>
              <div className="t-fieldrow">
                <Field label="선납(%)">
                  <input
                    type="number"
                    value={editStock.prepayPct}
                    onChange={(e) => setEditStock({ ...editStock, prepayPct: Number(e.target.value) })}
                  />
                </Field>
                <Field label="보증금(%)">
                  <input
                    type="number"
                    value={editStock.depositPct}
                    onChange={(e) => setEditStock({ ...editStock, depositPct: Number(e.target.value) })}
                  />
                </Field>
              </div>
              <Field label="주요 옵션 (쉼표로 구분)">
                <input
                  value={editStock.options}
                  placeholder="파노라마 선루프, 하만카돈"
                  onChange={(e) => setEditStock({ ...editStock, options: e.target.value })}
                />
              </Field>
              <Field label="특이사항">
                <textarea
                  value={editStock.note}
                  onChange={(e) => setEditStock({ ...editStock, note: e.target.value })}
                />
              </Field>
              <Field label="정렬 순서 (클수록 위)">
                <input
                  type="number"
                  value={editStock.sortOrder}
                  onChange={(e) => setEditStock({ ...editStock, sortOrder: Number(e.target.value) })}
                />
              </Field>
              <button className="t-cta-submit" type="submit">저장</button>
              <button
                type="button"
                className="t-cta-text"
                style={{ marginTop: 10 }}
                onClick={() => setEditStock(null)}
              >
                취소
              </button>
            </form>
          ) : (
            <>
              <button
                type="button"
                className="t-cta-plate"
                onClick={() =>
                  setEditStock({ id: 0, ...EMPTY_STOCK, sortOrder: stock.length + 1 })
                }
              >
                새 재고 등록
              </button>
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                {stock.map((s) => (
                  <div className="t-card" key={s.id}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <strong style={{ fontSize: 14.5 }}>
                        {s.brand} {s.model}
                      </strong>
                      <span className="t-badge" data-k={s.status === "계약완료" ? "done" : "now"}>
                        {s.status}
                      </span>
                      <span className="t-rev-meta t-mono">{s.code}</span>
                      <span style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
                        <button type="button" className="t-cta-text" onClick={() => setEditStock(s)}>
                          수정
                        </button>
                        <button
                          type="button"
                          className="t-cta-text"
                          style={{ color: "var(--t-notice)" }}
                          onClick={async () => {
                            await deleteRow({ data: { password, table: "stock", id: s.id } });
                            flash("삭제했습니다.");
                            await refresh();
                          }}
                        >
                          삭제
                        </button>
                      </span>
                    </div>
                  </div>
                ))}
                {stock.length === 0 ? (
                  <p className="t-note">
                    아직 등록한 재고가 없어 사이트에는 예시가 보입니다. 첫 건을 등록하면 예시는
                    사라집니다.
                  </p>
                ) : null}
              </div>
            </>
          )}
        </section>
      ) : null}

      {tab === "settings" ? (
        <section style={{ marginTop: 18 }}>
          <form
            className="t-form"
            onSubmit={async (e) => {
              e.preventDefault();
              const res = await saveLedger({ data: { password, ...ledger } });
              flash(res.ok ? "저장했습니다." : "저장하지 못했습니다.");
              if (res.ok) await refresh();
            }}
          >
            <h2 style={{ fontSize: 16, marginBottom: 12 }}>사이트 숫자</h2>
            <div className="t-fieldrow">
              <Field label="누적 출고 대수">
                <input
                  type="number"
                  value={ledger.total}
                  onChange={(e) => setLedger({ ...ledger, total: Number(e.target.value) })}
                />
              </Field>
              <Field label="이번 달 출고 대수">
                <input
                  type="number"
                  value={ledger.thisMonth}
                  onChange={(e) => setLedger({ ...ledger, thisMonth: Number(e.target.value) })}
                />
              </Field>
            </div>
            <Field label="자료 기준 시각">
              <input
                value={ledger.updatedAt}
                placeholder="2026.09.15 09:20"
                onChange={(e) => setLedger({ ...ledger, updatedAt: e.target.value })}
              />
            </Field>
            <p className="t-small" style={{ marginBottom: 12 }}>
              견적을 새로 올리실 때마다 이 시각을 같이 바꿔 주세요. 2주 이상 오래된 시각이
              찍혀 있으면 고객은 관리를 안 하는 사이트로 읽습니다.
            </p>
            <button className="t-cta-submit" type="submit">저장</button>
          </form>
        </section>
      ) : null}
    </div>
  );
}
