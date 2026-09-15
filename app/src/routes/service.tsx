import { createFileRoute, Link } from "@tanstack/react-router";

import { Page, SecHead } from "../components/site/chrome";
import { kakaoLink } from "../lib/site";

export const Route = createFileRoute("/service")({
  head: () => ({
    meta: [
      { title: "심사 서류 안내 · 타겟맨 신동엽" },
      {
        name: "description",
        content:
          "리스 장기렌트 심사에 필요한 서류를 개인, 개인사업자, 법인으로 나눠 정리했습니다. 발급처와 준비 기준까지 함께 안내합니다.",
      },
    ],
  }),
  component: Service,
});

export function Service() {
  return (
    <Page src="service">
      <div className="t-wrap">
        <section className="t-sec" style={{ paddingTop: 44 }}>
          <div className="t-eyebrow">Documents</div>
          <h1 style={{ fontSize: "clamp(26px,3.8vw,38px)", marginTop: 12, lineHeight: 1.3 }}>
            심사 서류 안내
          </h1>
        </section>

        <section className="t-sec">
          <SecHead ix="01" title="필요한 서류" />
          <div className="t-note" style={{ marginBottom: 18 }}>
            <b>서류는 최근 1개월 이내 발급본</b>으로 준비 부탁드립니다.
          </div>

          <div className="t-docs">
            <div className="t-doc">
              <h3>개인</h3>
              <ol>
                <li>면허증</li>
                <li>재직증명서</li>
                <li>
                  근로소득원천징수영수증 <em>최근 2년분</em>
                  <span className="t-doc-src">홈택스 발급</span>
                </li>
                <li>
                  건강보험 납부내역서
                  <span className="t-doc-src">국민건강보험 발급</span>
                </li>
                <li>
                  건강보험 자격 득실 확인서
                  <span className="t-doc-src">국민건강보험 발급</span>
                </li>
                <li>
                  주민등록등본
                  <span className="t-doc-src">정부24 발급</span>
                </li>
              </ol>
            </div>

            <div className="t-doc">
              <h3>개인사업자</h3>
              <ol>
                <li>사업자등록증</li>
                <li>대표자 면허증</li>
                <li>
                  부가세과세표준증명원 <em>최근 2년분</em>
                  <span className="t-doc-src">홈택스 발급</span>
                </li>
                <li>
                  주민등록등본
                  <span className="t-doc-src">정부24 발급</span>
                </li>
              </ol>
            </div>

            <div className="t-doc">
              <h3>법인</h3>
              <ol>
                <li>법인 사업자등록증</li>
                <li>대표자 운전면허증</li>
                <li>법인 등기부 등본</li>
                <li>
                  재무제표 <em>최근 2년분</em>
                </li>
                <li>
                  부가세과세표준증명원 <em>최근 2년분</em>
                  <span className="t-doc-src">홈택스 발급</span>
                </li>
                <li>
                  주주명부 <em>법인 인감 날인 필수</em>
                </li>
                <li>대표자 주민등록등본</li>
              </ol>
            </div>
          </div>

          <p className="t-small" style={{ marginTop: 14 }}>
            금융사와 심사 조건에 따라 요청 서류가 달라질 수 있습니다. 위 목록이 기준이고,
            추가로 필요한 서류가 생기면 그때 따로 말씀드립니다. 어떤 서류를 어디서 떼는지
            모르시면 카톡으로 물어봐 주세요.
          </p>
          <p style={{ marginTop: 16 }}>
            <a
              className="t-cta-plate"
              href={kakaoLink("service_docs")}
              target="_blank"
              rel="noreferrer"
            >
              서류 준비 물어보기
            </a>
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
