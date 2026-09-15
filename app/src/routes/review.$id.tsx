import { createFileRoute, Link } from "@tanstack/react-router";

import { PhotoFrame } from "../components/site/cards";
import { Comments } from "../components/site/comments";
import { Page } from "../components/site/chrome";
import { loadSiteContent } from "../lib/api/content.functions";
import { kakaoLink } from "../lib/site";

export const Route = createFileRoute("/review/$id")({
  loader: async () => await loadSiteContent(),
  component: ReviewDetail,
});

/**
 * 출고 한 건을 통째로 보여주는 페이지.
 * 목록 카드에서는 줄여 보여 주던 후기 원문과 댓글을 여기서는 그대로 다 펼칩니다.
 */
function ReviewDetail() {
  const data = Route.useLoaderData();
  const { id } = Route.useParams();
  const r = data.reviews.find((x) => String(x.id) === String(id));

  if (!r) {
    return (
      <Page src="reviews">
        <div className="t-wrap">
          <section className="t-sec" style={{ paddingTop: 48, paddingBottom: 40 }}>
            <h1 style={{ fontSize: "clamp(23px,3.2vw,32px)", lineHeight: 1.35 }}>
              찾으시는 출고 기록이 없습니다.
            </h1>
            <p className="t-lede t-col" style={{ marginTop: 16 }}>
              주소가 바뀌었거나 내려간 글일 수 있습니다. 전체 목록에서 다시 찾아 주세요.
            </p>
            <p style={{ marginTop: 22 }}>
              <Link to="/reviews" className="t-cta-text">
                출고 후기 전체 보기 <i aria-hidden="true">&rsaquo;</i>
              </Link>
            </p>
          </section>
        </div>
      </Page>
    );
  }

  const comments = data.comments.filter((c) => c.reviewId === r.id);
  const spec = (
    [
      ["출고일", r.date],
      ["계약 형태", r.contract],
      ["계약 기간", r.term ? `${r.term}개월` : ""],
      ["명의", r.owner],
      ["지역", r.region],
    ] as Array<[string, string]>
  ).filter(([, v]) => Boolean(v));

  return (
    <Page src="reviews" sample={data.reviewsAreSample ? "출고 후기" : undefined}>
      <div className="t-wrap">
        <section className="t-sec" style={{ paddingTop: 30 }}>
          <Link to="/reviews" className="t-back">
            <i aria-hidden="true">&lsaquo;</i> 출고 후기 전체
          </Link>

          <div className="t-eyebrow" style={{ marginTop: 20 }}>
            출고 기록
          </div>
          <h1 className="t-detail-h">
            {r.brand} {r.model}
          </h1>
          <p className="t-rev-meta" style={{ fontSize: 13, marginTop: 9 }}>
            {[r.date ? `${r.date} 출고` : "", r.customer].filter(Boolean).join(" · ")}
          </p>

          <div className="t-detail">
            <div className="t-detail-ph">
              <PhotoFrame
                photos={r.photo}
                alt={`${r.brand} ${r.model} 출고 사진`}
                empty="고객 실사 사진 자리"
              />
            </div>
            <aside className="t-detail-side">
              <dl className="t-spec">
                {spec.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <a
                className="t-cta-plate"
                href={kakaoLink(`review_${r.id}`)}
                target="_blank"
                rel="noreferrer"
                style={{ marginTop: 16 }}
              >
                이 조건으로 물어보기
              </a>
              <p className="t-small" style={{ marginTop: 12 }}>
                같은 차라도 선납금, 보증금, 계약기간, 주행거리, 명의 중 하나만 달라지면 월
                납입금은 바뀝니다. 이 기록은 약속이 아니라 실제로 있었던 한 건입니다.
              </p>
            </aside>
          </div>

          {r.quote ? (
            <blockquote className="t-detail-q">
              <p>{r.quote}</p>
              {r.customer ? <cite>{r.customer}</cite> : null}
            </blockquote>
          ) : null}

          {data.reviewsAreSample ? null : (
            <div className="t-detail-cm">
              <Comments reviewId={r.id} items={comments} />
            </div>
          )}

          <p style={{ marginTop: 34 }}>
            <Link to="/reviews" className="t-cta-text">
              다른 출고 기록 보기 <i aria-hidden="true">&rsaquo;</i>
            </Link>
          </p>
        </section>
      </div>
    </Page>
  );
}
