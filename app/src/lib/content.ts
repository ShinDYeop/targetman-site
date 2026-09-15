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
