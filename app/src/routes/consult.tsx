import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";

import { Page } from "../components/site/chrome";
import { submitConsult } from "../lib/api/consult.functions";
import { SITE, kakaoLink } from "../lib/site";

export const Route = createFileRoute("/consult")({
  head: () => ({
    meta: [
      { title: "상담 남기기 · 타겟맨 신동엽" },
      {
        name: "description",
        content:
          "차종이 정해지지 않았어도 괜찮습니다. 궁금한 내용을 그대로 적어 주시면 확인하고 직접 연락드립니다.",
      },
    ],
  }),
  component: Consult,
});

type State = "idle" | "sending" | "done" | "error";

function failMessage(reason: string) {
  switch (reason) {
    case "too_fast":
      return "잠시 후 다시 시도해 주세요.";
    case "rate_phone":
      return "같은 번호로 접수가 너무 잦습니다. 한 시간 뒤에 다시 시도하시거나 카톡으로 문의해 주세요.";
    case "rate_global":
      return "지금 접수가 몰리고 있습니다. 잠시 후 다시 시도하시거나 카톡으로 문의해 주세요.";
    case "bad_phone":
      return "연락처를 다시 확인해 주세요.";
    default:
      return "전송에 실패했습니다. 잠시 후 다시 시도하시거나 카톡으로 바로 문의해 주세요.";
  }
}


function Consult() {
  const [state, setState] = useState<State>("idle");
  const [agree, setAgree] = useState(false);
  const [failReason, setFailReason] = useState("");
  const openedAt = useRef(Date.now());

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!agree) return;
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) ?? "");
    setState("sending");
    try {
      const res = await submitConsult({
        data: {
          name: get("name"),
          phone: get("phone"),
          callWindow: get("callWindow"),
          memo: get("memo"),
          src: "consult_page",
          marketingOptin: fd.get("marketing") === "on",
          hp: String(fd.get("company") ?? ""),
          elapsedMs: Date.now() - openedAt.current,
        },
      });
      if (res.ok) {
        setState("done");
      } else {
        setFailReason(res.reason ?? "");
        setState("error");
      }
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <Page src="consult_done">
        <div className="t-wrap">
          <section className="t-sec" style={{ paddingTop: 64, maxWidth: 660 }}>
            <div className="t-done">
              <h3>상담 내용이 접수되었습니다</h3>
              <p style={{ color: "var(--t-ink-2)", lineHeight: 1.8 }}>
                남겨 주신 연락처로 직접 연락드리겠습니다. 영업시간(평일 09~19시) 기준 평균
                30분 안에 회신드립니다.
              </p>
              <p style={{ marginTop: 22 }}>
                <a
                  className="t-cta-plate"
                  href={kakaoLink("consult_done")}
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
    <Page src="consult">
      <div className="t-wrap">
        <section className="t-sec" style={{ paddingTop: 48, maxWidth: 680 }}>
          <div className="t-eyebrow">Consult</div>
          <h1 style={{ fontSize: "clamp(26px,3.6vw,38px)", marginTop: 12, lineHeight: 1.35 }}>
            궁금한 걸 그대로 적어 주세요
          </h1>
          <p className="t-lede" style={{ marginTop: 16 }}>
            차종이 정해지지 않으셨어도 괜찮습니다. 예산만 있으셔도 되고, 지금 타는 차 처분이
            고민이셔도 됩니다. 읽고 제가 직접 연락드립니다.
          </p>

          <form className="t-form" style={{ marginTop: 28 }} onSubmit={onSubmit}>
            <div className="t-hp" aria-hidden="true">
              <label htmlFor="c-company">회사명</label>
              <input id="c-company" name="company" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="t-field">
              <label htmlFor="c-memo">상담 내용</label>
              <textarea
                id="c-memo"
                name="memo"
                required
                maxLength={2000}
                style={{ minHeight: 180 }}
                placeholder={
                  "예시\n\n개인사업자이고 월 80만원 정도 생각하고 있습니다.\n출퇴근 왕복 60km라 주행거리가 좀 많은 편입니다.\n리스랑 렌트 중에 뭐가 나은지부터 모르겠습니다."
                }
              />
            </div>

            <div className="t-fieldrow">
              <div className="t-field">
                <label htmlFor="c-name">성함</label>
                <input id="c-name" name="name" required maxLength={40} />
              </div>
              <div className="t-field">
                <label htmlFor="c-phone">연락처</label>
                <input
                  id="c-phone"
                  name="phone"
                  required
                  inputMode="tel"
                  placeholder="010-0000-0000"
                />
              </div>
            </div>

            <div className="t-field">
              <label htmlFor="c-when">연락 가능한 시간대</label>
              <select id="c-when" name="callWindow" defaultValue="아무 때나">
                <option>아무 때나</option>
                <option>오전</option>
                <option>점심시간</option>
                <option>오후</option>
                <option>퇴근 후</option>
              </select>
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
                  상담 내용이며, 상담 진행 목적으로만 사용하고 상담 종료 후 6개월이 지나면
                  파기합니다. 동의를 거부하실 수 있으나, 이 경우 회신이 어렵습니다.
                </span>
              </label>
              <label>
                <input type="checkbox" name="marketing" />
                <span>
                  <b>[선택]</b> 신규 재고 입고, 이벤트 등 광고성 정보 수신에 동의합니다.
                  동의하지 않으셔도 상담에는 영향이 없습니다.
                </span>
              </label>
            </div>

            <button className="t-cta-submit" type="submit" disabled={!agree || state === "sending"}>
              {state === "sending" ? "보내는 중" : "상담 남기기"}
            </button>

            {state === "error" ? (
              <p className="t-small" style={{ marginTop: 14, color: "var(--t-notice)" }}>
                {failMessage(failReason)}
              </p>
            ) : null}
          </form>

          <div className="t-grid2" style={{ marginTop: 26 }}>
            <div className="t-card">
              <h3 style={{ fontSize: 17 }}>지금 바로 이야기하고 싶으시면</h3>
              <p className="t-small" style={{ marginTop: 8 }}>
                카톡이 가장 빠릅니다. {SITE.phone} 로 전화 주셔도 됩니다.
              </p>
              <p style={{ marginTop: 14 }}>
                <a
                  className="t-cta-text"
                  href={kakaoLink("consult_side")}
                  target="_blank"
                  rel="noreferrer"
                >
                  카톡 상담 열기 <i aria-hidden="true">&rsaquo;</i>
                </a>
              </p>
            </div>
            <div className="t-card">
              <h3 style={{ fontSize: 17 }}>차종이 이미 정해지셨다면</h3>
              <p className="t-small" style={{ marginTop: 8 }}>
                조건까지 입력하시면 실제 월 납입금을 계산해 회신드립니다.
              </p>
              <p style={{ marginTop: 14 }}>
                <Link to="/quote" className="t-cta-text">
                  견적 요청하기 <i aria-hidden="true">&rsaquo;</i>
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </Page>
  );
}
