import { createFileRoute, Link } from "@tanstack/react-router";

import { Page, SecHead } from "../components/site/chrome";
import { loadSiteContent } from "../lib/api/content.functions";
import { SITE, kakaoLink } from "../lib/site";

export const Route = createFileRoute("/videos")({
  head: () => ({
    meta: [
      { title: "차종별 영상 · 타겟맨 신동엽" },
      {
        name: "description",
        content: "채널의 차량 리뷰와 조건 설명 영상을 차종별로 모아 둡니다. 후기와 영상이 서로를 확인해 줍니다.",
      },
    ],
  }),
  loader: async () => await loadSiteContent(),
  component: Videos,
});

function Videos() {
  const data = Route.useLoaderData();
  const brands = Array.from(new Set(data.reviews.map((r) => r.brand)));

  return (
    <Page src="videos">
      <div className="t-wrap">
        <section className="t-sec" style={{ paddingTop: 48 }}>
          <div className="t-eyebrow">Videos</div>
          <h1 style={{ fontSize: "clamp(28px,4vw,40px)", marginTop: 12, lineHeight: 1.3 }}>
            글로 쓴 후기와 영상 속 사람이 같은 곳에 있습니다
          </h1>
          <p className="t-lede t-col" style={{ marginTop: 18 }}>
            후기는 조작할 수 있고, 영상도 편집할 수 있습니다. 하지만 둘이 서로 맞아떨어지는지는
            확인할 수 있습니다. 그래서 차종마다 후기와 영상을 나란히 둡니다.
          </p>
          <p style={{ marginTop: 24 }}>
            <a className="t-cta-plate" href={SITE.youtube} target="_blank" rel="noreferrer">
              유튜브 채널 전체 보기
            </a>
          </p>
        </section>

        <section className="t-sec">
          <SecHead ix="정리" title="브랜드별 영상" />
          <p className="t-lede t-col" style={{ marginBottom: 24 }}>
            아래 칸에 채널의 실제 영상을 연결할 자리입니다. 브랜드마다 대표 영상 2~3개를
            걸어 두면 검색으로 들어온 사람이 바로 확인할 수 있습니다.
          </p>
          <div className="t-grid3">
            {brands.map((b) => {
              const count = data.reviews.filter((r) => r.brand === b).length;
              return (
                <div className="t-rev" key={b}>
                  <div className="t-rev-photo">
                    <span>
                      {b} 영상 썸네일 자리
                      <br />
                      유튜브 링크 연결
                    </span>
                  </div>
                  <div className="t-rev-body">
                    <div className="t-rev-car">{b}</div>
                    <p className="t-rev-q">
                      이 브랜드로 {count}건의 출고 기록이 있습니다. 영상에서 설명한 조건과
                      실제 계약 조건을 비교해 보실 수 있습니다.
                    </p>
                    <p style={{ marginTop: "auto" }}>
                      <Link
                        to="/reviews"
                        className="t-cta-text"
                        style={{ fontSize: 13.5 }}
                      >
                        {b} 출고 후기 보기 <i aria-hidden="true">&rsaquo;</i>
                      </Link>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="t-sec">
          <div className="t-card t-col">
            <h3 style={{ fontSize: 19 }}>영상에 나온 차, 지금 가능한가요</h3>
            <p className="t-lede" style={{ marginTop: 10, fontSize: 15.5 }}>
              영상은 촬영 시점 기준입니다. 조건과 재고는 계속 바뀌기 때문에 현재 가능한 금액은
              따로 확인이 필요합니다.
            </p>
            <p style={{ marginTop: 20, display: "flex", gap: 14, flexWrap: "wrap" }}>
              <a
                className="t-cta-plate"
                href={kakaoLink("videos_end")}
                target="_blank"
                rel="noreferrer"
              >
                지금 조건 물어보기
              </a>
              <Link to="/stock" className="t-cta-text">
                즉시출고 재고 보기 <i aria-hidden="true">&rsaquo;</i>
              </Link>
            </p>
          </div>
        </section>
      </div>
    </Page>
  );
}
