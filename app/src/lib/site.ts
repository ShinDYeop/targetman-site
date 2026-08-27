export const SITE = {
  brand: "타겟맨 신동엽",
  brandShort: "타겟맨",
  tagline: "리스 · 장기렌트",
  youtube: "https://www.youtube.com/@targetman777",
  // 실제 운영 정보로 교체할 자리입니다.
  kakao: "https://pf.kakao.com/",
  phone: "010-0000-0000",
  bizName: "상호명 자리",
  bizNo: "000-00-00000",
  address: "사업장 주소 자리",
  updatedAt: "2026.08.27 09:20",
} as const;

export const LEDGER = {
  total: 312,
  thisMonth: 11,
  reviews: 98,
  years: 7,
} as const;

export const NAV = [
  { to: "/reviews", label: "출고 후기" },
  { to: "/stock", label: "즉시출고 재고" },
  { to: "/service", label: "서비스 안내" },
  { to: "/videos", label: "영상" },
  { to: "/about", label: "담당자" },
] as const;

export function kakaoLink(src: string) {
  return `${SITE.kakao}?src=${encodeURIComponent(src)}`;
}
