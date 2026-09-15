export const SITE = {
  brand: "타겟맨 신동엽",
  brandShort: "타겟맨",
  tagline: "리스 · 장기렌트",
  youtube: "https://www.youtube.com/@targetman777",
  kakao: "http://pf.kakao.com/_xgRExoK/chat",
  phone: "010-5113-0850",
  phoneTel: "01051130850",
  email: "ehdduq121@naver.com",
  address: "경기 남양주시 덕송2로 62, 604호",
} as const;

export const NAV = [
  { to: "/reviews", label: "출고 후기" },
  { to: "/estimates", label: "차량별 견적" },
  { to: "/service", label: "서비스 안내" },
  { to: "/videos", label: "영상" },
  { to: "/about", label: "담당자" },
] as const;

/**
 * 카카오 채팅 링크. 쿼리 파라미터를 붙이면 모바일 앱 전환이 깨질 수 있어
 * 주소는 손대지 않고, 유입 위치는 별도 이벤트로 측정합니다.
 */
export function kakaoLink(_src: string) {
  return SITE.kakao;
}
