import { createFileRoute, Link } from "@tanstack/react-router";

import { Page, SecHead } from "../components/site/chrome";
import { kakaoLink } from "../lib/site";

export const Route = createFileRoute("/service")({
  head: () => ({
    meta: [
      { title: "서비스 안내 · 타겟맨 신동엽" },
      {
        name: "description",
        content:
          "리스와 장기렌트의 차이, 계약 절차, 필요 서류, 비용 항목을 숨기지 않고 전부 공개합니다.",
      },
    ],
  }),
  component: Service,
});

export function Service() {
  return (
    <Page src="service">
      <div className="t-wrap">
        <section className="t-sec" style={{ paddingTop: 48 }}>
          <div className="t-eyebrow">Service</div>
          <h1 style={{ fontSize: "clamp(28px,4vw,40px)", marginTop: 12, lineHeight: 1.3 }}>
            숨기는 항목이 없는 것이 서비스입니다
          </h1>
          <p className="t-lede t-col" style={{ marginTop: 18 }}>
            리스와 장기렌트에서 분쟁이 생기는 지점은 대부분 정해져 있습니다. 중도해지 위약금,
            주행거리 초과 정산, 만기 인수 조건, 사고 시 부담 범위. 계약 전에 이 네 가지를 먼저
            설명드립니다.
          </p>
        </section>

        <section className="t-sec">
          <SecHead ix="01" title="필요한 서류" />
          <div className="t-tablewrap">
            <table>
              <thead>
                <tr>
                  <th>명의</th>
                  <th>기본 서류</th>
                  <th>추가로 요청될 수 있는 서류</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="t-k">개인</td>
                  <td>신분증, 자동차운전면허증</td>
                  <td>재직증명서, 소득금액증명원, 건강보험 자격득실확인서</td>
                </tr>
                <tr>
                  <td className="t-k">개인사업자</td>
                  <td>신분증, 사업자등록증</td>
                  <td>부가세과세표준증명원, 소득금액증명원, 사업장 임대차계약서</td>
                </tr>
                <tr>
                  <td className="t-k">법인</td>
                  <td>사업자등록증, 법인등기부등본, 인감증명서</td>
                  <td>재무제표, 주주명부, 이사회 의사록</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="t-small" style={{ marginTop: 12 }}>
            금융사와 심사 조건에 따라 요청 서류가 달라집니다. 필요한 것만 안내드리고, 미리
            다 준비하실 필요는 없습니다.
          </p>
        </section>

        <section className="t-sec">
          <SecHead ix="02" title="비용 항목" />
          <ul className="t-list t-col">
            <li>
              <b>월 납입금</b> : 계약기간, 선납금 비율, 보증금 비율, 연간 주행거리 네 가지가
              모두 바뀌면 같은 차도 금액이 완전히 달라집니다. 조건 없는 금액 비교는 의미가
              없습니다.
            </li>
            <li>
              <b>초기 비용</b> : 리스는 선납금, 장기렌트는 보증금 중심입니다. 보증금은 만기에
              반환되고 선납금은 반환되지 않습니다.
            </li>
            <li>
              <b>주행거리 초과 정산</b> : 약정 거리를 넘기면 km당 정산이 붙습니다. 계약 전에
              실제 주행 패턴을 확인하는 이유입니다.
            </li>
            <li>
              <b>중도해지 위약금</b> : 잔여 기간과 경과 기간에 따라 산정됩니다. 계약서 해당
              조항을 함께 읽고 진행합니다.
            </li>
            <li>
              <b>만기 처리</b> : 반납, 인수, 재계약 중 선택합니다. 인수 가격은 계약 시점에
              정해지는 경우와 만기 시점에 정해지는 경우가 있습니다.
            </li>
          </ul>
        </section>

        <section className="t-sec">
          <SecHead ix="03" title="심사에서 거절될 수도 있습니다" />
          <div className="t-note t-col">
            신용도, 소득 증빙, 기존 부채 상황에 따라 심사가 통과되지 않을 수 있습니다. 그
            경우 안 된다는 말로 끝내지 않고, 계약 형태 변경, 선납 조정, 명의 변경 등 가능한
            대안을 두 가지 이상 정리해서 보내드립니다. 그래도 어려우면 그렇다고
            말씀드립니다.
          </div>
        </section>

        <section className="t-sec">
          <SecHead ix="04" title="다음 단계" />
          <div className="t-grid2">
            <div className="t-card">
              <h3 style={{ fontSize: 19 }}>조건부터 계산받기</h3>
              <p className="t-lede" style={{ marginTop: 10, fontSize: 15 }}>
                차종과 예산을 남겨 주시면 실제 월 납입금을 계산해 회신드립니다.
              </p>
              <p style={{ marginTop: 18 }}>
                <Link to="/quote" className="t-cta-text">
                  견적 요청 <i aria-hidden="true">&rsaquo;</i>
                </Link>
              </p>
            </div>
            <div className="t-card">
              <h3 style={{ fontSize: 19 }}>먼저 물어보기</h3>
              <p className="t-lede" style={{ marginTop: 10, fontSize: 15 }}>
                내 상황에 리스가 맞는지 렌트가 맞는지부터 확인하고 싶으시면 카톡이 빠릅니다.
              </p>
              <p style={{ marginTop: 18 }}>
                <a
                  className="t-cta-plate"
                  href={kakaoLink("service_end")}
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
