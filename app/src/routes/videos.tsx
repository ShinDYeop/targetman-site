import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { Page, SecHead } from "../components/site/chrome";
import { loadSiteContent } from "../lib/api/content.functions";
import { youtubeThumb, youtubeWatch, type Video } from "../lib/content";
import { SITE, kakaoLink } from "../lib/site";

export const Route = createFileRoute("/videos")({
  head: () => ({
    meta: [
      { title: "브랜드별 영상 · 타겟맨 신동엽" },
      {
        name: "description",
        content:
          "타겟맨 신동엽 채널의 차량 설명과 출고 리뷰 영상을 브랜드별로 모아 둡니다. 후기와 영상이 서로를 확인해 줍니다.",
      },
    ],
  }),
  loader: async () => await loadSiteContent(),
  component: Videos,
});

/**
 * 영상 한 칸. 썸네일은 유튜브에 올린 그대로를 불러옵니다.
 * 큰 판(maxres)이 없는 영상도 있어서, 안 뜨면 작은 판으로 한 번 되돌립니다.
 */
function VideoCard({ v }: { v: Video }) {
  const [small, setSmall] = useState(false);
  if (!v.videoId) return null;

  return (
    <a
      className="t-vid"
      href={youtubeWatch(v.videoId)}
      target="_blank"
      rel="noreferrer"
      aria-label={`${v.title || v.brand} 영상 보기 (유튜브에서 열림)`}
    >
      <span className="t-vid-th">
        <img
          src={youtubeThumb(v.videoId, !small)}
          alt=""
          loading="lazy"
          onError={() => setSmall(true)}
          onLoad={(e) => {
            // 큰 판이 없는 영상이면 유튜브는 오류 대신 120px짜리 회색 그림을 내려줍니다.
            // 그래서 폭을 보고 직접 작은 판으로 되돌립니다.
            if (!small && e.currentTarget.naturalWidth <= 121) setSmall(true);
          }}
        />
        <span className="t-vid-play" aria-hidden="true">
          <svg viewBox="0 0 28 20" focusable="false">
            <rect width="28" height="20" rx="5" fill="#ff0000" />
            <path d="M11.4 5.8 18.6 10l-7.2 4.2V5.8Z" fill="#fff" />
          </svg>
        </span>
      </span>
      <span className="t-vid-body">
        {v.brand ? <span className="t-vid-brand">{v.brand}</span> : null}
        <span className="t-vid-title">{v.title || v.brand || "영상 보기"}</span>
        {v.note ? <span className="t-vid-note">{v.note}</span> : null}
      </span>
    </a>
  );
}

function Videos() {
  const data = Route.useLoaderData();
  const videos = data.videos.filter((v) => v.videoId);
  const [brand, setBrand] = useState("전체");

  const brands = ["전체", ...Array.from(new Set(videos.map((v) => v.brand).filter(Boolean)))];
  const list = videos.filter((v) => brand === "전체" || v.brand === brand);

  return (
    <Page src="videos">
      <div className="t-wrap">
        <section className="t-sec" style={{ paddingTop: 48 }}>
          <div className="t-eyebrow">Videos</div>
          <h1 style={{ fontSize: "clamp(26px,4vw,40px)", marginTop: 12, lineHeight: 1.3 }}>
            글로 쓴 후기와 영상 속 사람이 같은 곳에 있습니다
          </h1>
          <p className="t-lede t-col" style={{ marginTop: 18 }}>
            후기는 조작할 수 있고, 영상도 편집할 수 있습니다. 하지만 둘이 서로 맞아떨어지는지는
            확인할 수 있습니다. 그래서 차종마다 후기와 영상을 나란히 둡니다.
          </p>
          <p style={{ marginTop: 24 }}>
            <a className="t-cta-yt" href={SITE.youtube} target="_blank" rel="noreferrer">
              <svg viewBox="0 0 28 20" aria-hidden="true" focusable="false">
                <rect width="28" height="20" rx="5" fill="#fff" />
                <path d="M11.4 5.8 18.6 10l-7.2 4.2V5.8Z" fill="#ff0000" />
              </svg>
              유튜브 채널 전체 보기
            </a>
          </p>
        </section>

        <section className="t-sec">
          <SecHead ix="영상" title="브랜드별 영상" />

          {videos.length === 0 ? (
            <div className="t-note t-col">
              아직 여기에 걸어 둔 영상이 없습니다. 채널에는 계속 올라가고 있으니 위의 유튜브
              버튼으로 바로 확인해 주세요. 찾으시는 차종이 있으면 카톡으로 말씀해 주시면 해당
              영상 링크를 보내드립니다.
            </div>
          ) : (
            <>
              {brands.length > 2 ? (
                <div className="t-chips">
                  {brands.map((b) => (
                    <button
                      key={b}
                      type="button"
                      className="t-chip"
                      data-on={brand === b ? "1" : undefined}
                      onClick={() => setBrand(b)}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="t-vids">
                {list.map((v) => (
                  <VideoCard key={v.id} v={v} />
                ))}
              </div>

              {list.length === 0 ? (
                <p className="t-note">이 브랜드로 걸어 둔 영상이 아직 없습니다.</p>
              ) : null}

              <p className="t-small" style={{ marginTop: 16 }}>
                썸네일과 제목은 유튜브에 올라간 그대로입니다. 누르면 유튜브에서 열립니다.
              </p>
            </>
          )}
        </section>

        <section className="t-sec">
          <div className="t-card t-col">
            <h3 style={{ fontSize: 19 }}>영상에 나온 차, 지금 가능한가요</h3>
            <p className="t-lede" style={{ marginTop: 10, fontSize: 15.5 }}>
              영상은 촬영 시점 기준입니다. 조건과 재고는 계속 바뀌기 때문에 현재 가능한 금액은
              따로 확인이 필요합니다.
            </p>
            <p style={{ marginTop: 20, display: "flex", gap: 14, flexWrap: "wrap" }}>
              <a
                className="t-cta-plate"
                href={kakaoLink("videos_end")}
                target="_blank"
                rel="noreferrer"
              >
                지금 조건 물어보기
              </a>
              <Link to="/estimates" className="t-cta-text">
                차량별 견적 보기 <i aria-hidden="true">&rsaquo;</i>
              </Link>
            </p>
          </div>
        </section>
      </div>
    </Page>
  );
}
