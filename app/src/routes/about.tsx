import { createFileRoute, Link } from "@tanstack/react-router";

import { Page, SecHead, Plate } from "../components/site/chrome";
import { loadSiteContent } from "../lib/api/content.functions";
import { SITE, kakaoLink } from "../lib/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "담당자 소개 · 타겟맨 신동엽" },
      {
        name: "description",
        content: "유튜브에서 설명하는 사람과 계약을 담당하는 사람이 같습니다. 상담 중 담당자가 바뀌지 않습니다.",
      },
    ],
  }),
  loader: async () => await loadSiteContent(),
  component: About,
});

function About() {
  const data = Route.useLoaderData();
  return (
    <Page src="about">
      <div className="t-wrap">
        <section className="t-sec" style={{ paddingTop: 48 }}>
          <div className="t-eyebrow">About</div>
          <h1 style={{ fontSize: "clamp(28px,4vw,40px)", marginTop: 12, lineHeight: 1.3 }}>
            파는 사람이 누구인지 먼저 밝힙니다
          </h1>
          <p className="t-lede t-col" style={{ marginTop: 18 }}>
            리스와 장기렌트는 상품이 거의 같습니다. 금융사도 같고 차도 같습니다. 그래서
            남는 차이는 누가 담당하느냐 하나뿐입니다. 비교견적 플랫폼에서는 그 담당자가
            매번 바뀝니다. 여기서는 바뀌지 않습니다.
          </p>
        </section>

        <section className="t-sec">
          <div className="t-grid2">
            <div className="t-card">
              <Plate no="TM" size="lg" />
              <h3 style={{ fontSize: 24, marginTop: 16 }}>{SITE.brand}</h3>
              <p className="t-small" style={{ marginTop: 6 }}>
                {SITE.tagline} 상담 및 출고 담당
              </p>
              <ul className="t-list" style={{ marginTop: 18 }}>
                <li>
                  누적 출고 {data.ledger.total}대, 등록 후기 {data.reviews.length}건
                </li>
                <li>수입차와 국산차 리스 장기렌트 전 차종 상담</li>
                <li>개인, 개인사업자, 법인 명의 모두 진행</li>
                <li>유튜브 채널에서 차량 리뷰와 계약 조건을 직접 설명</li>
              </ul>
              <p style={{ marginTop: 20 }}>
                <a className="t-cta-text" href={SITE.youtube} target="_blank" rel="noreferrer">
                  유튜브 채널 보기 <i aria-hidden="true">&rsaquo;</i>
                </a>
              </p>
            </div>

            <div className="t-card">
              <div className="t-eyebrow">연락처</div>
              <h3 style={{ fontSize: 19, marginTop: 10 }}>확인하실 수 있게 공개합니다</h3>
              <dl className="t-spec" style={{ marginTop: 16, gridTemplateColumns: "1fr" }}>
                <div>
                  <dt>전화</dt>
                  <dd className="t-mono">
                    <a href={`tel:${SITE.phoneTel}`} style={{ color: "var(--t-plate)" }}>
                      {SITE.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>이메일</dt>
                  <dd>
                    <a href={`mailto:${SITE.email}`} style={{ color: "var(--t-plate)" }}>
                      {SITE.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>사업장 소재지</dt>
                  <dd>{SITE.address}</dd>
                </div>
                <div>
                  <dt>상담 가능 시간</dt>
                  <dd>평일 09~19시</dd>
                </div>
              </dl>
              <p className="t-small" style={{ marginTop: 16 }}>
                전화가 어려우실 때는 카톡이나 상담 남기기를 이용해 주세요. 남겨 주신 내용은
                제가 직접 확인합니다.
              </p>
            </div>
          </div>
        </section>

        <section className="t-sec">
          <SecHead ix="약속" title="상담에서 지키는 네 가지" />
          <div className="t-steps">
            <div>
              <span className="t-n">01</span>
              <h4>조건 없이 금액만 말하지 않습니다</h4>
              <p>월 납입금을 말씀드릴 때는 계약기간, 선납, 보증금, 주행거리를 반드시 같이 적습니다.</p>
            </div>
            <div>
              <span className="t-n">02</span>
              <h4>불리한 것을 먼저 말합니다</h4>
              <p>중도해지 위약금과 주행거리 초과 정산은 물어보시기 전에 설명드립니다.</p>
            </div>
            <div>
              <span className="t-n">03</span>
              <h4>안 되는 건 안 된다고 합니다</h4>
              <p>심사가 어려운 조건을 될 것처럼 말하지 않습니다. 대신 대안을 정리해 드립니다.</p>
            </div>
            <div>
              <span className="t-n">04</span>
              <h4>출고 후에도 담당자입니다</h4>
              <p>만기 6개월 전에 먼저 연락드립니다. 계약이 끝나야 관계가 끝나는 게 아닙니다.</p>
            </div>
          </div>
          <p style={{ marginTop: 26 }}>
            <Link to="/reviews" className="t-cta-text">
              실제로 그랬는지 후기에서 확인하기 <i aria-hidden="true">&rsaquo;</i>
            </Link>
          </p>
        </section>

        <section className="t-sec">
          <div className="t-card t-col">
            <p className="t-lede" style={{ fontSize: 16 }}>
              궁금한 게 생기면 계약과 상관없이 물어보셔도 됩니다. 지금 차를 바꿀 계획이
              없으셔도 괜찮습니다.
            </p>
            <p style={{ marginTop: 20 }}>
              <a
                className="t-cta-plate"
                href={kakaoLink("about_end")}
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
