import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Page } from "../components/site/chrome";
import { submitQuote } from "../lib/api/quote.functions";
import { BRANDS } from "../data/stock";
import { kakaoLink } from "../lib/site";

export const Route = createFileRoute("/quote")({
  head: () => ({
    meta: [
      { title: "견적 요청 · 타겟맨 신동엽" },
      {
        name: "description",
        content:
          "차종과 조건을 남겨 주시면 실제 월 납입금을 계산해 회신드립니다. 연락처는 견적 안내에만 사용합니다.",
      },
    ],
  }),
  component: Quote,
});

type State = "idle" | "sending" | "done" | "error";

function Quote() {
  const [state, setState] = useState<State>("idle");
  const [agree, setAgree] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!agree) return;
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) ?? "");
    setState("sending");
    try {
      const res = await submitQuote({
        data: {
          brand: get("brand"),
          model: get("model"),
          contractType: get("contractType"),
          termMonths: get("termMonths"),
          annualKm: get("annualKm"),
          ownerType: get("ownerType"),
          budget: get("budget"),
          timing: get("timing"),
          name: get("name"),
          phone: get("phone"),
          callWindow: get("callWindow"),
          memo: get("memo"),
          src: "quote_page",
          marketingOptin: fd.get("marketing") === "on",
        },
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <Page src="quote_done">
        <div className="t-wrap">
          <section className="t-sec" style={{ paddingTop: 64, maxWidth: 660 }}>
            <div className="t-done">
              <h3>견적 요청이 접수되었습니다</h3>
              <p style={{ color: "var(--t-ink-2)", lineHeight: 1.8 }}>
                영업시간 기준 평균 30분 안에 회신드립니다. 조건 조합에 따라 계산이 오래
                걸리는 차종은 시간이 더 필요할 수 있습니다.
              </p>
              <p style={{ marginTop: 22 }}>
                <a
                  className="t-cta-plate"
                  href={kakaoLink("quote_done")}
                  target="_blank"
                  rel="noreferrer"
                >
                  카톡으로 더 빠르게 받기
                </a>
              </p>
            </div>
          </section>
        </div>
      </Page>
    );
  }

  return (
    <Page src="quote">
      <div className="t-wrap">
        <section className="t-sec" style={{ paddingTop: 48, maxWidth: 720 }}>
          <div className="t-eyebrow">Quote</div>
          <h1 style={{ fontSize: "clamp(26px,3.6vw,38px)", marginTop: 12, lineHeight: 1.35 }}>
            조건을 남겨 주시면 실제 금액을 계산해 회신드립니다
          </h1>
          <p className="t-lede" style={{ marginTop: 16 }}>
            연락처는 견적 안내 목적으로만 사용하고, 상담이 끝난 뒤 6개월이 지나면 파기합니다.
            원하지 않으시면 그 전에라도 파기해 드립니다.
          </p>

          <form className="t-form" style={{ marginTop: 28 }} onSubmit={onSubmit}>
            <div className="t-fieldrow">
              <div className="t-field">
                <label htmlFor="q-brand">브랜드</label>
                <select id="q-brand" name="brand" defaultValue="">
                  <option value="">선택하지 않음</option>
                  {BRANDS.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                  <option>기타</option>
                </select>
              </div>
              <div className="t-field">
                <label htmlFor="q-model">모델 또는 관심 차종</label>
                <input id="q-model" name="model" placeholder="예: E250 AMG Line" />
              </div>
            </div>

            <div className="t-fieldrow">
              <div className="t-field">
                <label htmlFor="q-contract">계약 형태</label>
                <select id="q-contract" name="contractType" defaultValue="아직 모르겠음">
                  <option>아직 모르겠음</option>
                  <option>리스</option>
                  <option>장기렌트</option>
                </select>
              </div>
              <div className="t-field">
                <label htmlFor="q-term">계약 기간</label>
                <select id="q-term" name="termMonths" defaultValue="48개월">
                  <option>36개월</option>
                  <option>48개월</option>
                  <option>60개월</option>
                  <option>상담 후 결정</option>
                </select>
              </div>
            </div>

            <div className="t-fieldrow">
              <div className="t-field">
                <label htmlFor="q-km">연간 주행거리</label>
                <select id="q-km" name="annualKm" defaultValue="2만km">
                  <option>1만km</option>
                  <option>2만km</option>
                  <option>3만km 이상</option>
                  <option>잘 모르겠음</option>
                </select>
              </div>
              <div className="t-field">
                <label htmlFor="q-owner">명의</label>
                <select id="q-owner" name="ownerType" defaultValue="개인">
                  <option>개인</option>
                  <option>개인사업자</option>
                  <option>법인</option>
                </select>
              </div>
            </div>

            <div className="t-fieldrow">
              <div className="t-field">
                <label htmlFor="q-budget">희망 월 납입 범위</label>
                <select id="q-budget" name="budget" defaultValue="상담 후 결정">
                  <option>50만원 이하</option>
                  <option>50~80만원</option>
                  <option>80~120만원</option>
                  <option>120만원 이상</option>
                  <option>상담 후 결정</option>
                </select>
              </div>
              <div className="t-field">
                <label htmlFor="q-timing">인수 희망 시기</label>
                <select id="q-timing" name="timing" defaultValue="1개월 내">
                  <option>즉시</option>
                  <option>1개월 내</option>
                  <option>3개월 내</option>
                  <option>알아보는 중</option>
                </select>
              </div>
            </div>

            <div className="t-fieldrow">
              <div className="t-field">
                <label htmlFor="q-name">성함</label>
                <input id="q-name" name="name" required maxLength={40} />
              </div>
              <div className="t-field">
                <label htmlFor="q-phone">연락처</label>
                <input
                  id="q-phone"
                  name="phone"
                  required
                  inputMode="tel"
                  placeholder="010-0000-0000"
                />
              </div>
            </div>

            <div className="t-field">
              <label htmlFor="q-when">연락 가능한 시간대</label>
              <select id="q-when" name="callWindow" defaultValue="아무 때나">
                <option>아무 때나</option>
                <option>오전</option>
                <option>점심시간</option>
                <option>오후</option>
                <option>퇴근 후</option>
              </select>
            </div>

            <div className="t-field">
              <label htmlFor="q-memo">추가로 알려주실 내용</label>
              <textarea
                id="q-memo"
                name="memo"
                maxLength={1000}
                placeholder="예: 보험 경력을 이어가야 합니다 / 신용도가 걱정됩니다 / 특정 옵션이 꼭 필요합니다"
              />
            </div>

            <div className="t-consent">
              <label>
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  required
                />
                <span>
                  <b>[필수]</b> 개인정보 수집 및 이용에 동의합니다. 수집 항목은 성함, 연락처,
                  상담 내용이며, 견적 안내와 상담 목적으로만 사용하고 상담 종료 후 6개월이
                  지나면 파기합니다. 동의를 거부하실 수 있으나 이 경우 견적 회신이
                  어렵습니다.
                </span>
              </label>
              <label>
                <input type="checkbox" name="marketing" />
                <span>
                  <b>[선택]</b> 신규 재고 입고, 프로모션 등 광고성 정보 수신에 동의합니다.
                  동의하지 않으셔도 견적 요청에는 영향이 없습니다.
                </span>
              </label>
            </div>

            <button className="t-cta-submit" type="submit" disabled={!agree || state === "sending"}>
              {state === "sending" ? "보내는 중" : "견적 요청 보내기"}
            </button>

            {state === "error" ? (
              <p className="t-small" style={{ marginTop: 14, color: "var(--t-notice)" }}>
                전송에 실패했습니다. 잠시 후 다시 시도하시거나 카톡으로 바로 문의해 주세요.
              </p>
            ) : null}
          </form>

          <p className="t-small" style={{ marginTop: 18 }}>
            급하시면 폼 대신 카톡이 빠릅니다.{" "}
            <a
              href={kakaoLink("quote_side")}
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--t-plate)", borderBottom: "1px solid var(--t-plate)" }}
            >
              카톡 상담 열기
            </a>
          </p>
        </section>
      </div>
    </Page>
  );
}
