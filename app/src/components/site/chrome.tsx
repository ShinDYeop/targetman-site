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

export function SampleNotice({ what }: { what: string }) {
  return (
    <div className="t-notice">
      <div className="t-wrap">
        <b>안내</b>
        <span>
          아래 {what}은 화면 구조를 보여주기 위한 예시입니다. 관리자 페이지에서 첫 건을
          등록하시면 예시는 사라집니다. 견적 요청은 지금도 정상적으로 접수됩니다.
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
        <Link to="/consult">상담 남기기</Link>
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
          <b>연락처</b>
          <a href={`tel:${SITE.phoneTel}`}>{SITE.phone}</a>
          <br />
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          <br />
          <a href={kakaoLink("footer")} target="_blank" rel="noreferrer">
            카카오톡 상담
          </a>
        </div>
        <div>
          <b>사업장</b>
          {SITE.address}
          <br />
          상담 가능 시간 평일 09~19시
        </div>
        <div>
          <b>개인정보 안내</b>
          상담과 견적 요청 시 수집한 성함, 연락처, 상담 내용은 상담 진행 목적으로만
          사용하며, 상담 종료 후 6개월이 지나면 자동으로 파기됩니다. 접수 알림을 담당자
          메일로 보내는 과정에서 메일 발송 서비스를 거칩니다. 삭제를 원하시면 위 연락처로
          말씀해 주시면 즉시 지워드립니다.
          <br />
          <br />
          월 납입금은 계약기간, 선납금, 보증금, 연간 주행거리에 따라 달라집니다.
        </div>
      </div>
    </footer>
  );
}

export function Page({
  src,
  sample,
  children,
}: {
  src: string;
  sample?: string;
  children: ReactNode;
}) {
  return (
    <>
      {sample ? <SampleNotice what={sample} /> : null}
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
