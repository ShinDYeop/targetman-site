import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Page, SecHead } from "../components/site/chrome";
import { EstimateCard } from "../components/site/cards";
import { loadSiteContent } from "../lib/api/content.functions";
import { kakaoLink } from "../lib/site";

export const Route = createFileRoute("/estimates")({
  head: () => ({
    meta: [
      { title: "차량별 견적 · 타겟맨 신동엽" },
      {
        name: "description",
        content:
          "실제로 뽑아 본 차종별 리스 장기렌트 견적입니다. 견적표 원본과 조건 설명을 같이 올립니다.",
      },
    ],
  }),
  loader: async () => await loadSiteContent(),
  component: Estimates,
});

function Estimates() {
  const data = Route.useLoaderData();
  const [brand, setBrand] = useState("전체");
  const [contract, setContract] = useState("전체");

  const brands = useMemo(
    () => ["전체", ...Array.from(new Set(data.estimates.map((e) => e.brand).filter(Boolean)))],
    [data.estimates],
  );

  const list = data.estimates.filter(
    (e) =>
      (brand === "전체" || e.brand === brand) &&
      (contract === "전체" || e.contract === contract),
  );

  return (
    <Page src="estimates" sample={data.estimatesAreSample ? "차량별 견적" : undefined}>
      <div className="t-wrap">
        <section className="t-sec" style={{ paddingTop: 48 }}>
          <div className="t-eyebrow">Estimates</div>
          <h1 style={{ fontSize: "clamp(28px,4vw,42px)", marginTop: 12, lineHeight: 1.3 }}>
            실제로 뽑아 본 견적을 그대로 올립니다.
          </h1>
          <p className="t-lede t-col" style={{ marginTop: 18 }}>
            견적표 원본 사진과 조건 설명을 같이 올립니다. 숫자만 예쁘게 적어 두는 광고와
            다릅니다. 다만 이 금액은 <b>그 조건에서만</b> 나오는 금액입니다. 선납금, 보증금,
            계약기간, 주행거리, 명의 중 하나만 달라져도 월 납입금은 바뀝니다.
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
            <div className="t-field" style={{ marginBottom: 0, minWidth: 150 }}>
              <label htmlFor="e-brand">브랜드</label>
              <select id="e-brand" value={brand} onChange={(ev) => setBrand(ev.target.value)}>
                {brands.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>
            <div className="t-field" style={{ marginBottom: 0, minWidth: 150 }}>
              <label htmlFor="e-contract">계약 형태</label>
              <select
                id="e-contract"
                value={contract}
                onChange={(ev) => setContract(ev.target.value)}
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

          {list.map((e) => (
            <EstimateCard key={e.id} e={e} />
          ))}

          {list.length === 0 ? (
            <p className="t-note">
              선택하신 조건의 견적이 아직 올라와 있지 않습니다. 찾으시는 차종을 알려주시면
              그 차로 새로 뽑아 드립니다.
            </p>
          ) : null}
        </section>

        <section className="t-sec">
          <SecHead ix="문의" title="찾는 차가 없나요" />
          <div className="t-grid2">
            <div className="t-card">
              <h3 style={{ fontSize: 19 }}>내 조건으로 계산받기</h3>
              <p className="t-lede" style={{ marginTop: 10, fontSize: 15 }}>
                차종과 예산, 명의만 알려주시면 실제 월 납입금을 계산해 회신드립니다. 여기 없는
                차종도 대부분 가능합니다.
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
                견적표를 보시다가 이해가 안 되는 항목이 있으면 그 줄만 캡처해서 보내 주셔도
                됩니다. 항목별로 설명드립니다.
              </p>
              <p style={{ marginTop: 18 }}>
                <a
                  className="t-cta-plate"
                  href={kakaoLink("estimates_end")}
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
