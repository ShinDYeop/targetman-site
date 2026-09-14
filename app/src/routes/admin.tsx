import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { listRequests, type RequestRow } from "../lib/api/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "상담 접수함" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Admin,
});

function when(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${kst.getUTCFullYear()}.${p(kst.getUTCMonth() + 1)}.${p(kst.getUTCDate())} ${p(kst.getUTCHours())}:${p(kst.getUTCMinutes())}`;
}

function Admin() {
  const [password, setPassword] = useState("");
  const [rows, setRows] = useState<RequestRow[] | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "bad" | "error">("idle");

  async function load(e?: React.FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    setState("loading");
    try {
      const res = await listRequests({ data: { password } });
      if (!res.ok) {
        setState("bad");
        return;
      }
      setRows(res.rows);
      setState("idle");
    } catch {
      setState("error");
    }
  }

  if (!rows) {
    return (
      <div className="t-wrap" style={{ maxWidth: 420, paddingBlock: 90 }}>
        <div className="t-eyebrow">Admin</div>
        <h1 style={{ fontSize: 26, marginTop: 12 }}>상담 접수함</h1>
        <form className="t-form" style={{ marginTop: 24 }} onSubmit={load}>
          <div className="t-field">
            <label htmlFor="pw">비밀번호</label>
            <input
              id="pw"
              type="password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button className="t-cta-submit" type="submit" disabled={state === "loading"}>
            {state === "loading" ? "확인 중" : "열기"}
          </button>
          {state === "bad" ? (
            <p className="t-small" style={{ marginTop: 12, color: "var(--t-notice)" }}>
              비밀번호가 맞지 않습니다.
            </p>
          ) : null}
          {state === "error" ? (
            <p className="t-small" style={{ marginTop: 12, color: "var(--t-notice)" }}>
              불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
            </p>
          ) : null}
        </form>
      </div>
    );
  }

  const today = rows.filter((r) => {
    const d = new Date(r.created_at);
    return Date.now() - d.getTime() < 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="t-wrap" style={{ paddingBlock: 40 }}>
      <div className="t-eyebrow">Admin</div>
      <h1 style={{ fontSize: 28, marginTop: 10 }}>상담 접수함</h1>

      <dl className="t-counts" style={{ marginTop: 22 }}>
        <div>
          <dt>전체</dt>
          <dd>
            {rows.length}
            <small>건</small>
          </dd>
        </div>
        <div>
          <dt>최근 24시간</dt>
          <dd>
            {today}
            <small>건</small>
          </dd>
        </div>
        <div>
          <dt>마케팅 동의</dt>
          <dd>
            {rows.filter((r) => r.marketing_optin === 1).length}
            <small>건</small>
          </dd>
        </div>
      </dl>

      <p className="t-small" style={{ marginTop: 16 }}>
        최신순으로 최대 300건까지 보여줍니다. 이 화면에는 고객의 개인정보가 있습니다.
        공용 PC나 화면 공유 중에는 열지 마세요.
      </p>

      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 14 }}>
        {rows.map((r) => (
          <article className="t-card" key={r.id}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <span className="t-badge" data-k="now">
                견적
              </span>
              <strong style={{ fontSize: 17 }}>{r.name}</strong>
              <a
                className="t-mono"
                href={`tel:${r.phone.replace(/[^0-9+]/g, "")}`}
                style={{ color: "var(--t-plate)", fontSize: 15, fontWeight: 600 }}
              >
                {r.phone}
              </a>
              <span className="t-rev-meta t-mono" style={{ marginLeft: "auto" }}>
                {when(r.created_at)}
              </span>
            </div>

            <dl className="t-spec" style={{ marginTop: 12 }}>
              {r.brand || r.model ? (
                <div>
                  <dt>차종</dt>
                  <dd>{[r.brand, r.model].filter(Boolean).join(" ")}</dd>
                </div>
              ) : null}
              {r.contract_type ? (
                <div>
                  <dt>계약형태</dt>
                  <dd>
                    {r.contract_type}
                    {r.term_months ? ` · ${r.term_months}` : ""}
                  </dd>
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
              {r.annual_km ? (
                <div>
                  <dt>연 주행</dt>
                  <dd>{r.annual_km}</dd>
                </div>
              ) : null}
              {r.call_window ? (
                <div>
                  <dt>연락 시간</dt>
                  <dd>{r.call_window}</dd>
                </div>
              ) : null}
              <div>
                <dt>마케팅 수신</dt>
                <dd>{r.marketing_optin ? "동의" : "미동의"}</dd>
              </div>
            </dl>

            {r.memo ? (
              <p
                style={{
                  marginTop: 14,
                  whiteSpace: "pre-wrap",
                  fontSize: 14.5,
                  lineHeight: 1.8,
                  color: "var(--t-ink-2)",
                  borderLeft: "2px solid var(--t-plate)",
                  background: "var(--t-plate-soft)",
                  padding: "12px 14px",
                }}
              >
                {r.memo}
              </p>
            ) : null}
          </article>
        ))}
      </div>

      <p style={{ marginTop: 26 }}>
        <button type="button" className="t-cta-plate" onClick={() => load()}>
          새로고침
        </button>
      </p>
    </div>
  );
}
