import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { SITE, NAV, kakaoLink } from "../../lib/site";

export function Plate({ no, size }: { no: number | string; size?: "lg" }) {
  return (
    <span className={size === "lg" ? "t-plate t-plate-lg" : "t-plate"}>
      <span className="t-plate-kr">출고</span>
      {typeof no === "number" ? String(no).padStart(3, "0") : no}
    </span>
  );
}

export function SampleNotice() {
  return (
    <div className="t-notice">
      <div className="t-wrap">
        <b>샘플</b>
        <span>
          이 페이지의 출고 후기, 재고, 누적 수치는 화면 구조를 확인하기 위한 예시 데이터입니다.
          실제 출고 기록으로 교체하기 전까지는 실적으로 읽지 말아 주세요.
        </span>
      </div>
    </div>
  );
}

export function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <header className="t-head">
      <div className="t-wrap">
        <Link to="/" className="t-brand">
          <span className="t-nm">{SITE.brand}</span>
          <span className="t-tg">{SITE.tagline}</span>
        </Link>
        <nav className="t-nav">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} data-on={pathname === n.to ? "1" : undefined}>
              {n.label}
            </Link>
          ))}
          <Link to="/quote" data-on={pathname === "/quote" ? "1" : undefined}>
            견적 요청
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function MobileBar({ src }: { src: string }) {
  return (
    <>
      <div className="t-barpad" />
      <nav className="t-bar" aria-label="빠른 상담">
        <a href={kakaoLink(src)} target="_blank" rel="noreferrer">
          카톡 상담
        </a>
        <Link to="/quote">견적 요청</Link>
      </nav>
    </>
  );
}

export function Footer() {
  return (
    <footer className="t-foot">
      <div className="t-wrap t-fg">
        <div>
          <b>{SITE.brand}</b>
          {SITE.tagline} 상담 및 출고
          <br />
          <a href={SITE.youtube} target="_blank" rel="noreferrer">
            유튜브 채널 바로가기
          </a>
        </div>
        <div>
          <b>사업자 정보</b>
          상호 {SITE.bizName}
          <br />
          사업자등록번호 {SITE.bizNo}
          <br />
          {SITE.address}
        </div>
        <div>
          <b>문의</b>
          {SITE.phone}
          <br />
          <a href={kakaoLink("footer")} target="_blank" rel="noreferrer">
            카카오톡 채널
          </a>
        </div>
        <div>
          <b>안내</b>
          견적 요청 시 수집한 연락처는 견적 안내 목적으로만 사용하며, 상담 종료 후 6개월이
          지나면 파기합니다. 월 납입금은 계약기간, 선납금, 보증금, 연간 주행거리에 따라
          달라집니다.
        </div>
      </div>
      <div className="t-wrap" style={{ marginTop: 24, fontSize: 12 }}>
        사업자 정보, 연락처, 채널 주소는 실제 값으로 교체할 자리입니다.
      </div>
    </footer>
  );
}

export function Page({ src, children }: { src: string; children: ReactNode }) {
  return (
    <>
      <SampleNotice />
      <Header />
      <main>{children}</main>
      <Footer />
      <MobileBar src={src} />
    </>
  );
}

export function SecHead({
  ix,
  title,
  aside,
}: {
  ix: string;
  title: string;
  aside?: ReactNode;
}) {
  return (
    <div className="t-sec-head">
      <span className="t-ix">{ix}</span>
      <h2>{title}</h2>
      {aside ? <div className="t-aside">{aside}</div> : null}
    </div>
  );
}
