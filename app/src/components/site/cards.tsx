import { Plate } from "./chrome";
import { kakaoLink } from "../../lib/site";
import type { Review } from "../../data/reviews";
import type { StockItem } from "../../data/stock";

export function ReviewCard({ r }: { r: Review }) {
  return (
    <article className="t-rev">
      <div className="t-rev-photo">
        <span>
          고객 실사 사진 자리
          <br />
          번호판 마스킹 후 등록
        </span>
      </div>
      <div className="t-rev-body">
        <div className="t-rev-top">
          <Plate no={r.no} />
          <span className="t-rev-meta">{r.date}</span>
        </div>
        <div className="t-rev-car">
          {r.brand} {r.model}
        </div>
        <div className="t-rev-meta">
          {r.contract} {r.term}개월 · {r.owner} · {r.region}
        </div>
        <p className="t-rev-q">{r.quote}</p>
        <p className="t-rev-who">{r.customer}</p>
        <div className="t-rev-reply">
          <b>담당자 답글</b>
          {r.reply}
        </div>
      </div>
    </article>
  );
}

const won = (n: number) => `${Math.round(n / 10000)}만원`;

export function StockCard({ s }: { s: StockItem }) {
  const done = s.status === "계약완료";
  const badgeKind = done ? "done" : s.status === "상담중" ? "talk" : "now";
  const badgeText = done ? "계약완료" : s.status === "상담중" ? "상담중" : s.availDate === "즉시" ? "즉시출고" : "입고예정";

  return (
    <article className="t-stock" data-done={done ? "1" : undefined}>
      <div className="t-stock-photo">
        <span>차량 사진 자리</span>
      </div>
      <div>
        <div className="t-stock-body">
          <div className="t-stock-top">
            <span className="t-stock-name">
              {s.brand} {s.model}
            </span>
            <span className="t-badge" data-k={badgeKind}>
              {badgeText}
            </span>
            <span className="t-rev-meta t-mono">{s.id}</span>
          </div>
          <dl className="t-spec">
            <div>
              <dt>트림 연식</dt>
              <dd>
                {s.trim} · {s.year}
              </dd>
            </div>
            <div>
              <dt>색상</dt>
              <dd>
                {s.colorExt} / {s.colorInt}
              </dd>
            </div>
            <div>
              <dt>주행거리</dt>
              <dd className="t-mono">{s.mileageKm.toLocaleString("ko-KR")} km</dd>
            </div>
            <div>
              <dt>출고 가능</dt>
              <dd>{s.availDate}</dd>
            </div>
            <div>
              <dt>계약 형태</dt>
              <dd>{s.contract}</dd>
            </div>
            <div>
              <dt>주요 옵션</dt>
              <dd>{s.options.join(", ")}</dd>
            </div>
          </dl>
          <div className="t-price">
            월 {won(s.monthlyFrom)}부터
            <small>
              {s.termMonths}개월 · 선납 {s.prepayPct}% · 보증금 {s.depositPct}% · 연 2만km
              기준. 조건이 바뀌면 금액도 달라집니다.
            </small>
          </div>
          <p className="t-stock-note">{s.note}</p>
        </div>
        {done ? (
          <div className="t-cta-ask" style={{ color: "var(--t-muted)", cursor: "default" }}>
            <span>이 차량은 계약이 완료되었습니다. 동일 사양 입고 시 알려드릴 수 있습니다.</span>
          </div>
        ) : (
          <a
            className="t-cta-ask"
            href={kakaoLink(`stock_${s.id}`)}
            target="_blank"
            rel="noreferrer"
          >
            <span>이 차 조건 물어보기</span>
          </a>
        )}
      </div>
    </article>
  );
}
