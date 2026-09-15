import "./photos.css";

import { useRef, useState } from "react";

import { Plate } from "./chrome";
import { kakaoLink } from "../../lib/site";
import { photoList, photoUrl, type Estimate, type Review, type StockItem } from "../../lib/content";

/**
 * 사진 한 장이면 그대로, 여러 장이면 옆으로 미는 스트립으로 보여줍니다.
 * 몇 번째 장인지 항상 찍어 두어야 고객이 더 있다는 걸 압니다.
 */
export function PhotoFrame({
  photos,
  alt,
  empty,
}: {
  photos: string;
  alt: string;
  empty: string;
}) {
  const keys = photoList(photos);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [idx, setIdx] = useState(0);

  /** 지정한 장으로 부드럽게 넘깁니다. 손가락으로 미는 것과 같은 자리로 갑니다. */
  function go(n: number) {
    const el = trackRef.current;
    if (!el) return;
    const next = Math.max(0, Math.min(keys.length - 1, n));
    el.scrollTo({ left: el.clientWidth * next, behavior: "smooth" });
    setIdx(next);
  }

  /** 손가락으로 민 경우에도 몇 번째인지 따라갑니다. */
  function onScroll() {
    const el = trackRef.current;
    if (!el) return;
    const n = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
    setIdx(Math.max(0, Math.min(keys.length - 1, n)));
  }

  if (keys.length === 0) {
    if (!empty) return null;
    return (
      <div className="t-rev-photo">
        <span>{empty}</span>
      </div>
    );
  }

  if (keys.length === 1) {
    return (
      <div className="t-rev-photo" style={{ padding: 0 }}>
        <img
          src={photoUrl(keys[0])}
          alt={alt}
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    );
  }

  return (
    <div className="t-ph">
      <div className="t-photos" ref={trackRef} onScroll={onScroll}>
        {keys.map((k, i) => (
          <div className="t-photos-i" key={`${k}-${i}`}>
            <img src={photoUrl(k)} alt={`${alt} ${i + 1}`} loading={i === 0 ? "eager" : "lazy"} />
          </div>
        ))}
      </div>

      <button
        type="button"
        className="t-ph-nav"
        data-d="prev"
        onClick={() => go(idx - 1)}
        disabled={idx === 0}
        aria-label="이전 사진"
      >
        &#8249;
      </button>
      <button
        type="button"
        className="t-ph-nav"
        data-d="next"
        onClick={() => go(idx + 1)}
        disabled={idx === keys.length - 1}
        aria-label="다음 사진"
      >
        &#8250;
      </button>

      <div className="t-ph-dots">
        {keys.map((k, i) => (
          <button
            type="button"
            key={`dot-${k}-${i}`}
            className="t-ph-dot"
            data-on={i === idx ? "1" : undefined}
            onClick={() => go(i)}
            aria-label={`${i + 1}번째 사진 보기`}
            aria-current={i === idx ? "true" : undefined}
          />
        ))}
      </div>

      <span className="t-photos-n">
        {idx + 1} / {keys.length}
      </span>
    </div>
  );
}

export function ReviewCard({ r }: { r: Review }) {
  return (
    <article className="t-rev">
      <PhotoFrame
        photos={r.photo}
        alt={`${r.brand} ${r.model} 출고 사진`}
        empty="고객 실사 사진 자리"
      />
      <div className="t-rev-body">
        <div className="t-rev-top">
          {r.no > 0 ? <Plate no={r.no} /> : null}
          <span className="t-rev-meta">{r.date}</span>
        </div>
        <div className="t-rev-car">
          {r.brand} {r.model}
        </div>
        <div className="t-rev-meta">
          {[r.contract, r.term ? `${r.term}개월` : "", r.owner, r.region]
            .filter(Boolean)
            .join(" · ")}
        </div>
        {r.quote ? <p className="t-rev-q">{r.quote}</p> : null}
        {r.customer ? <p className="t-rev-who">{r.customer}</p> : null}
        {r.reply ? (
          <div className="t-rev-reply">
            <b>담당자 답글</b>
            {r.reply}
          </div>
        ) : null}
      </div>
    </article>
  );
}

const won = (n: number) => `${Math.round(n / 10000)}만원`;

export function StockCard({ s }: { s: StockItem }) {
  const done = s.status === "계약완료";
  const badgeKind = done ? "done" : s.status === "상담중" ? "talk" : "now";
  const badgeText = done
    ? "계약완료"
    : s.status === "상담중"
      ? "상담중"
      : s.availDate === "즉시"
        ? "즉시출고"
        : "입고예정";

  return (
    <article className="t-stock" data-done={done ? "1" : undefined}>
      <PhotoFrame photos={s.photo} alt={`${s.brand} ${s.model}`} empty="" />
      <div>
        <div className="t-stock-body">
          <div className="t-stock-top">
            <span className="t-stock-name">
              {s.brand} {s.model}
            </span>
            <span className="t-badge" data-k={badgeKind}>
              {badgeText}
            </span>
            {s.code ? <span className="t-rev-meta t-mono">{s.code}</span> : null}
          </div>
          <dl className="t-spec">
            {s.trim || s.year ? (
              <div>
                <dt>트림 연식</dt>
                <dd>{[s.trim, s.year || ""].filter(Boolean).join(" · ")}</dd>
              </div>
            ) : null}
            {s.colorExt || s.colorInt ? (
              <div>
                <dt>색상</dt>
                <dd>{[s.colorExt, s.colorInt].filter(Boolean).join(" / ")}</dd>
              </div>
            ) : null}
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
            {s.options ? (
              <div>
                <dt>주요 옵션</dt>
                <dd>{s.options}</dd>
              </div>
            ) : null}
          </dl>
          {s.monthlyFrom > 0 ? (
            <div className="t-price">
              월 {won(s.monthlyFrom)}부터
              <small>
                {s.termMonths}개월 · 선납 {s.prepayPct}% · 보증금 {s.depositPct}% · 연 2만km
                기준. 조건이 바뀌면 금액도 달라집니다.
              </small>
            </div>
          ) : null}
          {s.note ? <p className="t-stock-note">{s.note}</p> : null}
        </div>
        {done ? (
          <div className="t-cta-ask" style={{ color: "var(--t-muted)", cursor: "default" }}>
            <span>계약이 완료된 차량입니다. 동일 사양 입고 시 알려드릴 수 있습니다.</span>
          </div>
        ) : (
          <a
            className="t-cta-ask"
            href={kakaoLink(`stock_${s.code || s.id}`)}
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

export function EstimateCard({ e }: { e: Estimate }) {
  return (
    <article className="t-est">
      <PhotoFrame
        photos={e.photo}
        alt={`${e.brand} ${e.model} 견적표`}
        empty="견적표 사진 자리"
      />
      <div className="t-est-body">
        <div className="t-est-top">
          <span className="t-est-car">
            {e.brand} {e.model}
          </span>
          {e.trim ? <span className="t-est-trim">{e.trim}</span> : null}
          {e.quotedAt ? <span className="t-est-when">{e.quotedAt} 산출</span> : null}
        </div>
        <div className="t-rev-meta" style={{ marginTop: 6 }}>
          {[e.contract, e.termMonths ? `${e.termMonths}개월` : ""].filter(Boolean).join(" · ")}
        </div>

        {e.monthlyFrom > 0 ? (
          <div className="t-price" style={{ marginTop: 12 }}>
            월 {won(e.monthlyFrom)}부터
            <small>
              아래 조건 기준입니다. 선납금, 보증금, 주행거리, 명의 중 하나만 바뀌어도 금액이
              달라집니다. 이 숫자는 약속이 아니라 예시입니다.
            </small>
          </div>
        ) : null}

        {e.body ? <p className="t-est-text">{e.body}</p> : null}
      </div>
      <a
        className="t-cta-ask"
        href={kakaoLink(`estimate_${e.id}`)}
        target="_blank"
        rel="noreferrer"
      >
        <span>내 조건으로 다시 뽑아보기</span>
      </a>
    </article>
  );
}
