import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Page, SecHead } from "../components/site/chrome";
import { StockCard } from "../components/site/cards";
import { loadSiteContent } from "../lib/api/content.functions";
import { kakaoLink } from "../lib/site";

export const Route = createFileRoute("/stock")({
  head: () => ({
    meta: [
      { title: "즉시출고 재고 · 타겟맨 신동엽" },
      {
        name: "description",
        content:
          "지금 바로 인도 가능한 리스 장기렌트 재고입니다. 계약이 끝난 차량도 마감 표시로 남겨 둡니다.",
      },
    ],
  }),
  loader: async () => await loadSiteContent(),
  component: Stock,
});

function Stock() {
  const data = Route.useLoaderData();
  const [brand, setBrand] = useState("전체");
  const [contract, setContract] = useState("전체");
  const [onlyNow, setOnlyNow] = useState(false);

  const brands = useMemo(
    () => ["전체", ...Array.from(new Set(data.stock.map((s) => s.brand)))],
    [data.stock],
  );

  const list = data.stock.filter(
    (s) =>
      (brand === "전체" || s.brand === brand) &&
      (contract === "전체" || s.contract.includes(contract)) &&
      (!onlyNow || (s.availDate === "즉시" && s.status !== "계약완료")),
  );

  const openCount = data.stock.filter((s) => s.status !== "계약완료").length;

  return (
    <Page src="stock" sample={data.stockIsSample ? "재고 목록" : undefined}>
      <div className="t-wrap">
        <section className="t-sec" style={{ paddingTop: 48 }}>
          <div className="t-eyebrow">Stock</div>
          <h1 style={{ fontSize: "clamp(28px,4vw,42px)", marginTop: 12, lineHeight: 1.3 }}>
            지금 받을 수 있는 차 {openCount}대
          </h1>
          <div
            className="t-note t-col"
            style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 6 }}
          >
            {data.ledger.updatedAt ? (
              <b className="t-mono" style={{ fontSize: 13, color: "var(--t-accent)" }}>
                {data.ledger.updatedAt} 기준
              </b>
            ) : null}
            <span>
              캐피탈에서 받은 자료를 주 2회 반영합니다. 계약이 완료된 차량은 목록에서 지우지
              않고 마감 표시로 남겨 둡니다. 실제로 나간다는 기록이자, 방금 나갔다는 설명이
              사실임을 보여주는 방법입니다.
            </span>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              margin: "28px 0 26px",
              alignItems: "flex-end",
            }}
          >
            <div className="t-field" style={{ marginBottom: 0, minWidth: 150 }}>
              <label htmlFor="s-brand">브랜드</label>
              <select id="s-brand" value={brand} onChange={(e) => setBrand(e.target.value)}>
                {brands.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>
            <div className="t-field" style={{ marginBottom: 0, minWidth: 150 }}>
              <label htmlFor="s-contract">계약 형태</label>
              <select
                id="s-contract"
                value={contract}
                onChange={(e) => setContract(e.target.value)}
              >
                <option>전체</option>
                <option>리스</option>
                <option>장기렌트</option>
              </select>
            </div>
            <label
              className="t-small"
              style={{ display: "flex", gap: 8, alignItems: "center", paddingBottom: 12 }}
            >
              <input
                type="checkbox"
                checked={onlyNow}
                onChange={(e) => setOnlyNow(e.target.checked)}
                style={{ accentColor: "var(--t-plate)" }}
              />
              즉시출고만 보기
            </label>
          </div>

          {list.map((s) => (
            <StockCard key={s.id} s={s} />
          ))}

          {list.length === 0 ? (
            <p className="t-note">조건에 맞는 재고가 지금은 없습니다. 아래에서 알림을 신청해 주세요.</p>
          ) : null}
        </section>

        <section className="t-sec">
          <SecHead ix="문의" title="원하는 차가 목록에 없나요" />
          <div className="t-grid2">
            <div className="t-card">
              <h3 style={{ fontSize: 19 }}>차종 입고 알림</h3>
              <p className="t-lede" style={{ marginTop: 10, fontSize: 15 }}>
                찾으시는 차종과 조건을 남겨 두시면 해당 사양이 들어올 때 먼저 연락드립니다.
                지금 계약하지 않으셔도 됩니다.
              </p>
              <p style={{ marginTop: 18 }}>
                <Link to="/quote" className="t-cta-text">
                  조건 남기기 <i aria-hidden="true">&rsaquo;</i>
                </Link>
              </p>
            </div>
            <div className="t-card">
              <h3 style={{ fontSize: 19 }}>바로 물어보기</h3>
              <p className="t-lede" style={{ marginTop: 10, fontSize: 15 }}>
                목록에 없는 차도 대부분 구성 가능합니다. 차종과 예산만 알려주시면 가능 여부를
                먼저 확인해 드립니다.
              </p>
              <p style={{ marginTop: 18 }}>
                <a
                  className="t-cta-plate"
                  href={kakaoLink("stock_end")}
                  target="_blank"
                  rel="noreferrer"
                >
                  카톡 상담
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </Page>
  );
}
