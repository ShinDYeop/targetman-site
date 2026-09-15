import { createFileRoute, Link } from "@tanstack/react-router";

import { Page, SecHead, Plate } from "../components/site/chrome";
import { ReviewCard, EstimateCard } from "../components/site/cards";
import { loadSiteContent } from "../lib/api/content.functions";
import { SITE, kakaoLink } from "../lib/site";

export const Route = createFileRoute("/")({
  loader: async () => await loadSiteContent(),
  component: Home,
});

const STEPS = [
  { n: "01", t: "상담", d: "원하시는 차종, 명의, 예산 범위를 확인합니다. 이 단계에서 서류는 필요 없습니다.", w: "당일" },
  { n: "02", t: "조건 확정", d: "계약기간, 선납금, 보증금, 주행거리를 조합해 실제 월 납입금을 확정합니다.", w: "1일" },
  { n: "03", t: "심사", d: "금융사 심사를 진행합니다. 거절될 수 있고, 그 경우 대안을 두 가지 이상 정리해 드립니다.", w: "1~3일" },
  { n: "04", t: "계약", d: "계약서 조항을 항목별로 함께 확인합니다. 중도해지 위약금 구조를 먼저 설명드립니다.", w: "1일" },
  { n: "05", t: "인도", d: "차량 상태를 촬영해 보내드리고, 인수 현장에서 체크리스트를 같이 확인합니다.", w: "차종별 상이" },
];

function Home() {
  const data = Route.useLoaderData();
  const latest = data.reviews.slice(0, 3);
  const ledgerRows = data.reviews.slice(0, 6);
  const estimates = data.estimates.slice(0, 2);

  const sample = [
    data.reviewsAreSample ? "출고 후기" : "",
    data.estimatesAreSample ? "차량별 견적" : "",
  ]
    .filter(Boolean)
    .join("와 ");

  return (
    <Page src="home" sample={sample}>
      <div className="t-wrap">
        <section className="t-hero">
          <div className="t-eyebrow t-rise">리스 · 장기렌트 출고 대장</div>
          <h1 className="t-rise t-rise-2">
            유튜브에서 보시던 그 사람이,
            <br />
            계약서 끝까지 직접 담당합니다.
          </h1>
          <p className="t-sub t-rise t-rise-3">
            출고 한 건마다 번호를 붙여 공개합니다. 몇 대를 인도했는지, 고객이 실제로 뭐라고
            했는지, 어떤 차가 어떤 조건에서 얼마였는지 전부 이 페이지에 있습니다.
          </p>
          <div className="t-hero-actions">
            <Link to="/estimates" className="t-cta-plate">
              차량별 견적 보기
            </Link>
            <a
              className="t-cta-text"
              href={kakaoLink("home_hero")}
              target="_blank"
              rel="noreferrer"
            >
              1:1 카톡 상담 <i aria-hidden="true">&rsaquo;</i>
            </a>
          </div>

          <div className="t-ledger t-rise t-rise-2">
            <div className="t-ledger-hd">최근 출고 기록</div>
            {ledgerRows.map((r) => (
              <div className="t-ledger-row" key={r.id}>
                <span className="t-no">No.{r.no}</span>
                <span className="t-car">
                  {r.brand} {r.model}
                </span>
                <span className="t-dt">{r.date}</span>
              </div>
            ))}
          </div>
        </section>

        <dl className="t-counts">
          <div>
            <dt>누적 출고</dt>
            <dd>
              {data.ledger.total}
              <small>대</small>
            </dd>
          </div>
          <div>
            <dt>이번 달 출고</dt>
            <dd>
              {data.ledger.thisMonth}
              <small>대</small>
            </dd>
          </div>
          <div>
            <dt>등록된 후기</dt>
            <dd>
              {data.reviews.length}
              <small>건</small>
            </dd>
          </div>
        </dl>

        <section className="t-sec">
          <SecHead
            ix="01"
            title="출고 후기"
            aside={
              <Link to="/reviews" className="t-cta-text">
                전체 보기 <i aria-hidden="true">&rsaquo;</i>
              </Link>
            }
          />
          <p className="t-lede" style={{ marginBottom: 14 }}>
            사진과 날짜가 있는 후기만 올립니다. 고객이 쓴 문장은 고치지 않고, 불리한 이야기도
            지우지 않습니다.
          </p>
          <div className="t-grid3">
            {latest.map((r) => (
              <ReviewCard key={r.id} r={r} />
            ))}
          </div>
        </section>

        <section className="t-sec">
          <SecHead
            ix="02"
            title="차량별 견적"
            aside={
              <Link to="/estimates" className="t-cta-text">
                전체 보기 <i aria-hidden="true">&rsaquo;</i>
              </Link>
            }
          />
          <p className="t-lede" style={{ marginBottom: 14 }}>
            실제로 뽑아 본 견적표를 원본 그대로 올립니다. 다만 그 금액은 그 조건에서만 나오는
            금액입니다. 선납금 하나만 바뀌어도 월 납입금은 달라집니다.
          </p>
          {estimates.map((e) => (
            <EstimateCard key={e.id} e={e} />
          ))}
          <p style={{ marginTop: 16 }}>
            <Link to="/estimates" className="t-cta-text">
              견적 전체 보기 <i aria-hidden="true">&rsaquo;</i>
            </Link>
          </p>
        </section>

        <section className="t-sec">
          <SecHead ix="03" title="리스와 장기렌트, 30초 비교" />
          <div className="t-tablewrap">
            <table>
              <thead>
                <tr>
                  <th>항목</th>
                  <th>리스</th>
                  <th>장기렌트</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="t-k">번호판</td>
                  <td>일반 번호판</td>
                  <td>허 하 호 번호판</td>
                </tr>
                <tr>
                  <td className="t-k">법적 성격</td>
                  <td>여신전문금융업법상 시설대여</td>
                  <td>여객자동차운수사업법상 자동차대여사업</td>
                </tr>
                <tr>
                  <td className="t-k">보험</td>
                  <td>본인 명의로 가입, 경력 인정</td>
                  <td>렌터카사 보험 적용, 사고 시 할증 부담이 다름</td>
                </tr>
                <tr>
                  <td className="t-k">초기 비용</td>
                  <td>선납금 중심</td>
                  <td>보증금 중심</td>
                </tr>
                <tr>
                  <td className="t-k">자주 맞는 경우</td>
                  <td>보험 경력을 이어가야 하는 개인, 법인 업무용</td>
                  <td>초기 비용을 낮추고 관리를 맡기고 싶은 경우</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="t-note" style={{ marginTop: 14 }}>
            둘 중 무엇이 유리한지는 명의, 보험 경력, 주행거리, 만기 계획에 따라 완전히
            달라집니다. 표만 보고 결정하지 마시고 한 번 물어보세요.
          </div>
          <p style={{ marginTop: 14 }}>
            <a className="t-cta-text" href={kakaoLink("home_compare")} target="_blank" rel="noreferrer">
              내 상황엔 뭐가 맞는지 물어보기 <i aria-hidden="true">&rsaquo;</i>
            </a>
          </p>
        </section>

        <section className="t-sec">
          <SecHead ix="04" title="상담부터 인도까지" />
          <div className="t-steps">
            {STEPS.map((s) => (
              <div key={s.n}>
                <span className="t-n">{s.n}</span>
                <h4>{s.t}</h4>
                <p>{s.d}</p>
                <span className="t-when">소요 {s.w}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="t-sec">
          <SecHead ix="05" title="담당자" />
          <div className="t-grid2">
            <div className="t-card">
              <Plate no="TM" size="lg" />
              <h3 style={{ fontSize: 18, marginTop: 10 }}>{SITE.brand}</h3>
              <p className="t-lede" style={{ marginTop: 8 }}>
                유튜브 채널에서 차량 리뷰와 리스 장기렌트 조건을 설명하는 사람과 실제 계약을
                담당하는 사람이 같습니다. 상담 중 담당자가 바뀌지 않습니다.
              </p>
              <p style={{ marginTop: 14 }}>
                <Link to="/about" className="t-cta-text">
                  담당자 소개 <i aria-hidden="true">&rsaquo;</i>
                </Link>
              </p>
            </div>
            <div className="t-card">
              <div className="t-eyebrow">YouTube</div>
              <h3 style={{ fontSize: 17, marginTop: 8 }}>영상으로 먼저 확인하세요</h3>
              <p className="t-lede" style={{ marginTop: 8 }}>
                이 페이지의 후기와 견적에 나오는 차종은 대부분 채널에 영상이 있습니다. 글과
                영상이 서로를 확인해 주는 구조입니다.
              </p>
              <p style={{ marginTop: 14 }}>
                <Link to="/videos" className="t-cta-text">
                  차종별 영상 보기 <i aria-hidden="true">&rsaquo;</i>
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </Page>
  );
}
