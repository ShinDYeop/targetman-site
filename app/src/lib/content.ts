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
  reply: string;
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
  reply: "",
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

/** R2에 저장된 사진 키를 화면에서 쓸 주소로 바꿉니다. */
export function photoUrl(photo: string): string {
  if (!photo) return "";
  if (photo.startsWith("http://") || photo.startsWith("https://")) return photo;
  return `/api/img?k=${encodeURIComponent(photo)}`;
}
