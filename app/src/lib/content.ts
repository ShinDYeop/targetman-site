export type Review = {
  id: number;
  no: number;
  date: string;
  brand: string;
  model: string;
  contract: string;
  term: number;
  region: string;
  owner: string;
  customer: string;
  quote: string;
  photo: string;
  published: number;
};

export type StockItem = {
  id: number;
  code: string;
  status: string;
  brand: string;
  model: string;
  trim: string;
  year: number;
  colorExt: string;
  colorInt: string;
  mileageKm: number;
  contract: string;
  availDate: string;
  termMonths: number;
  prepayPct: number;
  depositPct: number;
  monthlyFrom: number;
  options: string;
  note: string;
  photo: string;
  sortOrder: number;
};

/**
 * 차량별 견적. 견적표 사진 여러 장과 자유 설명 글이 본체이고,
 * 차종과 월 납입금만 따로 받아서 목록에서 고르고 정렬할 수 있게 합니다.
 */
export type Estimate = {
  id: number;
  brand: string;
  model: string;
  trim: string;
  contract: string;
  termMonths: number;
  monthlyFrom: number;
  quotedAt: string;
  body: string;
  photo: string;
  published: number;
  sortOrder: number;
};

/**
 * 브랜드별 유튜브 영상. 주소만 넣어 두면 썸네일은 유튜브에서 그대로 불러옵니다.
 * 영상 파일을 우리가 들고 있지 않으니 용량 걱정도 없습니다.
 */
export type Video = {
  id: number;
  brand: string;
  title: string;
  url: string;
  videoId: string;
  note: string;
  published: number;
  sortOrder: number;
};

/** 고객이 후기에 남기는 공개 댓글. 이름은 화면에 나갈 때 가려집니다. */
export type Comment = {
  id: number;
  reviewId: number;
  name: string;
  body: string;
  createdAt: string;
  approved: number;
};

export type Ledger = { total: number; thisMonth: number; updatedAt: string };

export const EMPTY_REVIEW: Omit<Review, "id"> = {
  no: 0,
  date: "",
  brand: "",
  model: "",
  contract: "리스",
  term: 48,
  region: "",
  owner: "개인",
  customer: "",
  quote: "",
  photo: "",
  published: 1,
};

export const EMPTY_VIDEO: Omit<Video, "id"> = {
  brand: "",
  title: "",
  url: "",
  videoId: "",
  note: "",
  published: 1,
  sortOrder: 0,
};

export const EMPTY_STOCK: Omit<StockItem, "id"> = {
  code: "",
  status: "판매중",
  brand: "",
  model: "",
  trim: "",
  year: new Date().getFullYear(),
  colorExt: "",
  colorInt: "",
  mileageKm: 0,
  contract: "리스 · 장기렌트",
  availDate: "즉시",
  termMonths: 48,
  prepayPct: 0,
  depositPct: 0,
  monthlyFrom: 0,
  options: "",
  note: "",
  photo: "",
  sortOrder: 0,
};

export const EMPTY_ESTIMATE: Omit<Estimate, "id"> = {
  brand: "",
  model: "",
  trim: "",
  contract: "리스",
  termMonths: 48,
  monthlyFrom: 0,
  quotedAt: "",
  body: "",
  photo: "",
  published: 1,
  sortOrder: 0,
};

/**
 * 사진은 한 칸에 쉼표로 이어 붙여 저장합니다. 키에는 쉼표가 들어가지 않으므로
 * 표 구조를 바꾸지 않고도 여러 장을 담을 수 있습니다.
 */
export function photoList(photos: string): string[] {
  if (!photos) return [];
  return photos
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function photoJoin(list: string[]): string {
  return list.filter(Boolean).join(",");
}

/** R2에 저장된 사진 키를 화면에서 쓸 주소로 바꿉니다. */
export function photoUrl(photo: string): string {
  if (!photo) return "";
  if (photo.startsWith("http://") || photo.startsWith("https://")) return photo;
  return `/api/img?k=${encodeURIComponent(photo)}`;
}

/** 화면에 나가는 이름은 성만 남깁니다. 김동엽 → 김○○ */
export function maskName(name: string): string {
  const t = name.trim();
  if (!t) return "";
  if (t.length === 1) return `${t}○`;
  return t[0] + "○".repeat(Math.min(t.length - 1, 4));
}

/**
 * 유튜브 주소에서 영상 아이디만 뽑습니다.
 * 일반 주소, 공유(youtu.be) 주소, 쇼츠, 임베드, 라이브 주소를 모두 받습니다.
 * 못 알아보면 빈 문자열을 돌려주고, 화면에서는 "주소를 다시 확인해 주세요"로 안내합니다.
 */
export function youtubeId(input: string): string {
  const s = (input || "").trim();
  if (!s) return "";
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  const pats = [
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /\/shorts\/([A-Za-z0-9_-]{11})/,
    /\/embed\/([A-Za-z0-9_-]{11})/,
    /\/live\/([A-Za-z0-9_-]{11})/,
  ];
  for (const re of pats) {
    const m = s.match(re);
    if (m) return m[1];
  }
  return "";
}

/**
 * 유튜브 썸네일 주소.
 * 고화질 판(maxresdefault)은 없는 영상이 많고, 없을 때 오류 대신 회색 그림을 내려주기 때문에
 * 어떤 영상에나 반드시 있는 hqdefault 를 씁니다. 화면에서는 16:9로 잘라 넣습니다.
 */
export function youtubeThumb(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function youtubeWatch(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

/**
 * 출고일을 정렬용 숫자로 바꿉니다. 2026.09.10 과 2026.9.18 처럼
 * 자리수를 다르게 적으셔도 같은 기준으로 비교됩니다. 못 읽으면 0.
 */
export function reviewDateKey(date: string): number {
  const m = (date || "").match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
  if (!m) return 0;
  return Number(m[1]) * 10000 + Number(m[2]) * 100 + Number(m[3]);
}

/** 본문에 적은 [사진1] 표시에서 몇 번째 사진을 썼는지 뽑습니다. (0부터) */
export function usedPhotoIndexes(text: string): number[] {
  const out: number[] = [];
  const re = /\[사진\s*(\d{1,2})\]/g;
  let m = re.exec(text || "");
  while (m) {
    const n = Number(m[1]) - 1;
    if (n >= 0) out.push(n);
    m = re.exec(text || "");
  }
  return out;
}

/** 목록 카드에서는 사진 표시를 빼고 글만 미리 보여 줍니다. */
export function stripPhotoTokens(text: string): string {
  return (text || "")
    .replace(/\[사진\s*\d{1,2}\]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
