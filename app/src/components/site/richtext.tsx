import "./richtext.css";

import { useEffect, useRef, useState } from "react";

import { Lightbox } from "./lightbox";
import { photoList, photoUrl } from "../../lib/content";

const SPLIT = /(\[사진\s*\d{1,2}\])/;

/**
 * 본문 사진 한 장.
 * 카톡 화면처럼 세로로 아주 긴 사진은 그대로 두면 글을 덮어 버립니다.
 * 그래서 긴 사진은 위쪽만 보여 주는 창으로 줄이고, 아래를 흐리게 해서
 * 더 있다는 걸 알려 줍니다. 전체는 눌러서 보시면 됩니다.
 */
function BodyPhoto({
  src,
  alt,
  onOpen,
}: {
  src: string;
  alt: string;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLImageElement | null>(null);
  const [tall, setTall] = useState(false);

  function check(el: HTMLImageElement | null) {
    if (!el || !el.naturalWidth) return;
    if (el.naturalHeight > el.naturalWidth * 1.6) setTall(true);
  }

  useEffect(() => {
    const el = ref.current;
    if (el?.complete) check(el);
  }, []);

  return (
    <figure className="t-rt-fig" data-tall={tall ? "1" : undefined}>
      <button type="button" onClick={onOpen} aria-label={`${alt} 크게 보기`}>
        <img
          ref={ref}
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={(e) => check(e.currentTarget)}
        />
      </button>
      <figcaption>{tall ? "일부만 보입니다 · 눌러서 전체 보기" : "눌러서 크게 보기"}</figcaption>
    </figure>
  );
}
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
            <BodyPhoto
              key={`f-${i}`}
              src={photoUrl(keys[n])}
              alt={`${alt} ${n + 1}`}
              onOpen={() => setLb(n)}
            />
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
