import { createFileRoute, Link } from "@tanstack/react-router";

import { PhotoFrame } from "../components/site/cards";
import { Page } from "../components/site/chrome";
import { loadSiteContent } from "../lib/api/content.functions";
import { kakaoLink } from "../lib/site";

export const Route = createFileRoute("/estimate/$id")({
  loader: async () => await loadSiteContent(),
  component: EstimateDetail,
});

const won = (n: number) => `${Math.round(n / 10000)}만원`;

/**
 * 견적 한 건을 통째로 보여주는 페이지.
 * 목록에서는 줄여 보여 주던 조건 설명과 견적표 사진을 여기서는 그대로 다 펼칩니다.
 */
function EstimateDetail() {
  const data = Route.useLoaderData();
  const { id } = Route.useParams();
  const e = data.estimates.find((x) => String(x.id) === String(id));

  if (!e) {
    return (
      <Page src="estimates">
        <div className="t-wrap">
          <section className="t-sec" style={{ paddingTop: 48, paddingBottom: 40 }}>
            <h1 style={{ fontSize: "clamp(23px,3.2vw,32px)", lineHeight: 1.35 }}>
              찾으시는 견적이 없습니다.
            </h1>
            <p className="t-lede t-col" style={{ marginTop: 16 }}>
              주소가 바뀌었거나 내려간 견적일 수 있습니다. 전체 목록에서 다시 찾아 주세요.
            </p>
            <p style={{ marginTop: 22 }}>
              <Link to="/estimates" className="t-cta-text">
                차량별 견적 전체 보기 <i aria-hidden="true">&rsaquo;</i>
              </Link>
            </p>
          </section>
        </div>
      </Page>
    );
  }

  const spec = (
    [
      ["계약 형태", e.contract],
      ["계약 기간", e.termMonths ? `${e.termMonths}개월` : ""],
      ["트림", e.trim],
      ["산출 시점", e.quotedAt],
    ] as Array<[string, string]>
  ).filter(([, v]) => Boolean(v));

  return (
    <Page src="estimates" sample={data.estimatesAreSample ? "차량별 견적" : undefined}>
      <div className="t-wrap">
        <section className="t-sec" style={{ paddingTop: 30 }}>
          <Link to="/estimates" className="t-back">
            <i aria-hidden="true">&lsaquo;</i> 차량별 견적 전체
          </Link>

          <div className="t-eyebrow" style={{ marginTop: 20 }}>
            견적
          </div>
          <h1 className="t-detail-h">
            {e.brand} {e.model}
          </h1>
          <p className="t-rev-meta" style={{ fontSize: 13, marginTop: 9 }}>
            {[e.trim, e.quotedAt ? `${e.quotedAt} 산출` : ""].filter(Boolean).join(" · ")}
          </p>

          <div className="t-detail">
            <div className="t-detail-ph">
              <PhotoFrame
                photos={e.photo}
                alt={`${e.brand} ${e.model} 견적표`}
                empty="견적표 사진 자리"
                zoom
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
              {e.monthlyFrom > 0 ? (
                <div className="t-price" style={{ marginTop: 14 }}>
                  월 {won(e.monthlyFrom)}부터
                  <small>
                    위 조건 기준입니다. 선납금, 보증금, 주행거리, 명의 중 하나만 바뀌어도
                    금액이 달라집니다. 이 숫자는 약속이 아니라 실제로 뽑아 본 한 건입니다.
                  </small>
                </div>
              ) : null}
              <a
                className="t-cta-plate"
                href={kakaoLink(`estimate_${e.id}`)}
                target="_blank"
                rel="noreferrer"
                style={{ marginTop: 16 }}
              >
                내 조건으로 다시 뽑아보기
              </a>
            </aside>
          </div>

          {e.body ? (
            <div className="t-detail-q">
              <p>{e.body}</p>
            </div>
          ) : null}

          <div className="t-grid2" style={{ marginTop: 26 }}>
            <div className="t-card">
              <h3 style={{ fontSize: 18 }}>내 조건으로 계산받기</h3>
              <p className="t-lede" style={{ marginTop: 10, fontSize: 15 }}>
                차종과 예산, 명의만 알려주시면 실제 월 납입금을 계산해 회신드립니다.
              </p>
              <p style={{ marginTop: 16 }}>
                <Link to="/quote" className="t-cta-text">
                  조건 남기기 <i aria-hidden="true">&rsaquo;</i>
                </Link>
              </p>
            </div>
            <div className="t-card">
              <h3 style={{ fontSize: 18 }}>항목이 이해 안 되면</h3>
              <p className="t-lede" style={{ marginTop: 10, fontSize: 15 }}>
                견적표를 보시다가 모르겠는 줄이 있으면 그 부분만 캡처해서 보내 주세요.
                항목별로 설명드립니다.
              </p>
              <p style={{ marginTop: 16 }}>
                <a
                  className="t-cta-text"
                  href={kakaoLink(`estimate_ask_${e.id}`)}
                  target="_blank"
                  rel="noreferrer"
                >
                  카톡으로 물어보기 <i aria-hidden="true">&rsaquo;</i>
                </a>
              </p>
            </div>
          </div>

          <p style={{ marginTop: 30 }}>
            <Link to="/estimates" className="t-cta-text">
              다른 차종 견적 보기 <i aria-hidden="true">&rsaquo;</i>
            </Link>
          </p>
        </section>
      </div>
    </Page>
  );
}
