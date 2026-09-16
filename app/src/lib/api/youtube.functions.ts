import { createServerFn } from "@tanstack/react-start";

/** 타겟맨 채널. 주소(@targetman777)가 아니라 바뀌지 않는 채널 아이디를 씁니다. */
const CHANNEL_ID = "UCI_vWlvMl460KuTQsqg3JcA";
const FEED = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const HOW_MANY = 6;
const TTL_MS = 30 * 60 * 1000;

export type LatestVideo = { videoId: string; title: string; published: string };

/** 같은 서버가 살아 있는 동안은 30분에 한 번만 유튜브에 물어봅니다. */
let cache: { at: number; rows: LatestVideo[] } = { at: 0, rows: [] };

function unescapeXml(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function parse(xml: string): LatestVideo[] {
  const rows: LatestVideo[] = [];
  const entries = /<entry>([\s\S]*?)<\/entry>/g;
  let m = entries.exec(xml);
  while (m && rows.length < HOW_MANY) {
    const e = m[1];
    const id = /<yt:videoId>([^<]+)<\/yt:videoId>/.exec(e)?.[1] ?? "";
    const title = /<title>([\s\S]*?)<\/title>/.exec(e)?.[1] ?? "";
    const published = /<published>([^<]+)<\/published>/.exec(e)?.[1] ?? "";
    if (/^[A-Za-z0-9_-]{11}$/.test(id)) {
      rows.push({ videoId: id, title: unescapeXml(title).trim(), published });
    }
    m = entries.exec(xml);
  }
  return rows;
}

/**
 * 채널에 올라온 최신 영상 목록.
 * 유튜브가 공개하는 주소 목록(RSS)만 읽습니다. 키도 필요 없고, 영상을 저장하지도 않습니다.
 * 못 읽어 오면 직전에 읽어 둔 목록을 그대로 쓰고, 그것도 없으면 빈 목록을 돌려줍니다.
 */
export const loadLatestVideos = createServerFn({ method: "GET" }).handler(
  async (): Promise<LatestVideo[]> => {
    if (cache.rows.length && Date.now() - cache.at < TTL_MS) return cache.rows;
    try {
      const res = await fetch(FEED, { headers: { accept: "application/atom+xml" } });
      if (!res.ok) return cache.rows;
      const rows = parse(await res.text());
      if (rows.length) cache = { at: Date.now(), rows };
      return rows.length ? rows : cache.rows;
    } catch {
      return cache.rows;
    }
  },
);
