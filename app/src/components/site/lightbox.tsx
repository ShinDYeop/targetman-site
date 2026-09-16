import "./lightbox.css";

import { useEffect, useState } from "react";

import { photoUrl } from "../../lib/content";

/**
 * 사진 크게 보기.
 * 견적표처럼 글씨가 작은 사진은 화면에 맞춰 보여 주는 것만으로는 안 읽히기 때문에,
 * 한 번 더 누르면 원본 크기로 펼쳐 놓고 끌어서 볼 수 있게 합니다.
 */
export function Lightbox({
  keys,
  index,
  alt,
  onMove,
  onClose,
}: {
  keys: string[];
  index: number;
  alt: string;
  onMove: (n: number) => void;
  onClose: () => void;
}) {
  const [full, setFull] = useState(false);

  useEffect(() => setFull(false), [index]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onMove(index - 1);
      else if (e.key === "ArrowRight") onMove(index + 1);
    }
    document.addEventListener("keydown", onKey);
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = before;
    };
  }, [index, onMove, onClose]);

  const many = keys.length > 1;

  return (
    <div
      className="t-lb"
      role="dialog"
      aria-modal="true"
      aria-label="사진 크게 보기"
      onClick={onClose}
    >
      <div className="t-lb-stage" data-full={full ? "1" : undefined} onClick={onClose}>
        <img
          src={photoUrl(keys[index])}
          alt={alt}
          onClick={(e) => {
            e.stopPropagation();
            setFull((v) => !v);
          }}
        />
      </div>

      <button type="button" className="t-lb-x" onClick={onClose} aria-label="닫기">
        &times;
      </button>

      {many ? (
        <>
          <button
            type="button"
            className="t-lb-nav"
            data-d="prev"
            disabled={index === 0}
            aria-label="이전 사진"
            onClick={(e) => {
              e.stopPropagation();
              onMove(index - 1);
            }}
          >
            &#8249;
          </button>
          <button
            type="button"
            className="t-lb-nav"
            data-d="next"
            disabled={index === keys.length - 1}
            aria-label="다음 사진"
            onClick={(e) => {
              e.stopPropagation();
              onMove(index + 1);
            }}
          >
            &#8250;
          </button>
        </>
      ) : null}

      <div className="t-lb-bar" onClick={(e) => e.stopPropagation()}>
        {many ? (
          <span className="t-lb-n">
            {index + 1} / {keys.length}
          </span>
        ) : null}
        <span className="t-lb-hint">
          {full ? "사진을 다시 누르면 화면에 맞춥니다" : "사진을 누르면 원본 크기로 커집니다"}
        </span>
      </div>
    </div>
  );
}
