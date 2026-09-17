import "./richtext.css";

import { useState } from "react";

import { Lightbox } from "./lightbox";
import { photoList, photoUrl } from "../../lib/content";

const SPLIT = /(\[사진\s*\d{1,2}\])/;
const ONE = /^\[사진\s*(\d{1,2})\]$/;

/**
 * 블로그처럼 글 사이에 사진이 들어가는 본문.
 * 관리자가 원문 안에 [사진1] 처럼 적어 두면 그 자리에 올린 사진이 들어갑니다.
 * 없는 번호를 적었으면 아무것도 넣지 않고 조용히 넘어갑니다.
 */
export function RichText({
  text,
  photos,
  alt,
}: {
  text: string;
  photos: string;
  alt: string;
}) {
  const keys = photoList(photos);
  const [lb, setLb] = useState(-1);
  const parts = (text || "").split(SPLIT);

  return (
    <div className="t-rt">
      {parts.map((part, i) => {
        const m = part.match(ONE);
        if (m) {
          const n = Number(m[1]) - 1;
          if (!keys[n]) return null;
          return (
            <figure className="t-rt-fig" key={`f-${i}`}>
              <button
                type="button"
                onClick={() => setLb(n)}
                aria-label={`${n + 1}번째 사진 크게 보기`}
              >
                <img src={photoUrl(keys[n])} alt={`${alt} ${n + 1}`} loading="lazy" />
              </button>
              <figcaption>눌러서 크게 보기</figcaption>
            </figure>
          );
        }
        const t = part.replace(/^\n+/, "").replace(/\n+$/, "");
        if (!t.trim()) return null;
        return (
          <p className="t-rt-p" key={`p-${i}`}>
            {t}
          </p>
        );
      })}

      {lb >= 0 ? (
        <Lightbox
          keys={keys}
          index={lb}
          alt={alt}
          onMove={(n) => setLb(Math.max(0, Math.min(keys.length - 1, n)))}
          onClose={() => setLb(-1)}
        />
      ) : null}
    </div>
  );
}
