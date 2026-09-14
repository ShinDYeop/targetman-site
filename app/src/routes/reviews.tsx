import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Page, SecHead } from "../components/site/chrome";
import { ReviewCard } from "../components/site/cards";
import { loadSiteContent } from "../lib/api/content.functions";
import { kakaoLink } from "../lib/site";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "출고 후기 · 타겟맨 신동엽" },
      {
        name: "description",
        content:
          "사진과 날짜가 있는 출고 후기만 번호를 붙여 공개합니다. 브랜드와 계약 형태로 골라 보세요.",
      },
    ],
  }),
  loader: async () => await loadSiteContent(),
  component: Reviews,
});

function Reviews() {
  const data = Route.useLoaderData();
  const [brand, setBrand] = useState("전체");
  const [contract, setContract] = useState("전체");

  const brands = useMemo(
    () => ["전체", ...Array.from(new Set(data.reviews.map((r) => r.brand)))],
    [data.reviews],
  );

  const list = data.reviews.filter(
    (r) =>
      (brand === "전체" || r.brand === brand) &&
      (contract === "전체" || r.contract === contract),
  );

  return (
    <Page src="reviews" sample={data.reviewsAreSample ? "출고 후기" : undefined}>
      <div className="t-wrap">
        <section className="t-sec" style={{ paddingTop: 48 }}>
          <div className="t-eyebrow">Reviews</div>
          <h1 style={{ fontSize: "clamp(28px,4vw,42px)", marginTop: 12, lineHeight: 1.3 }}>
            지금까지 {data.ledger.total}대를 인도했습니다.
          </h1>
          <p className="t-lede t-col" style={{ marginTop: 18 }}>
            사진과 날짜가 남아 있는 건만 올립니다. 고객이 쓴 문장은 맞춤법도 고치지 않습니다.
            좋은 이야기만 골라 담으면 후기는 광고가 되고, 광고가 된 후기는 아무도 믿지
            않습니다.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              margin: "28px 0 26px",
              alignItems: "flex-end",
            }}
          >
            <div className="t-field" style={{ marginBottom: 0, minWidth: 160 }}>
              <label htmlFor="f-brand">브랜드</label>
              <select id="f-brand" value={brand} onChange={(e) => setBrand(e.target.value)}>
                {brands.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>
            <div className="t-field" style={{ marginBottom: 0, minWidth: 160 }}>
              <label htmlFor="f-contract">계약 형태</label>
              <select
                id="f-contract"
                value={contract}
                onChange={(e) => setContract(e.target.value)}
              >
                <option>전체</option>
                <option>리스</option>
                <option>장기렌트</option>
              </select>
            </div>
            <p className="t-small" style={{ paddingBottom: 12 }}>
              {list.length}건 표시 중
            </p>
          </div>

          <div className="t-grid3">
            {list.map((r) => (
              <ReviewCard key={r.no} r={r} />
            ))}
          </div>

          {list.length === 0 ? (
            <p className="t-note">
              선택하신 조건의 후기가 아직 없습니다. 해당 차종 출고 사례는 카톡으로 물어봐
              주세요.
            </p>
          ) : null}
        </section>

        <section className="t-sec">
          <SecHead ix="다음" title="나도 이렇게 출고하기" />
          <div className="t-card t-col">
            <p className="t-lede" style={{ fontSize: 16 }}>
              후기에 나온 조건 그대로를 원하실 수도 있고, 전혀 다른 차를 보고 계실 수도
              있습니다. 어느 쪽이든 먼저 물어보시는 게 빠릅니다.
            </p>
            <p style={{ marginTop: 20 }}>
              <a
                className="t-cta-plate"
                href={kakaoLink("reviews_end")}
                target="_blank"
                rel="noreferrer"
              >
                카톡으로 물어보기
              </a>
            </p>
          </div>
        </section>
      </div>
    </Page>
  );
}
