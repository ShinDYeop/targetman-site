/**
 * 모든 응답에 붙는 보안 헤더.
 * frame-ancestors 계열은 넣지 않습니다. 이 플랫폼의 디자인 인스펙터가
 * 배포된 사이트를 iframe으로 열기 때문에 그걸 막으면 편집 기능이 깨집니다.
 * HSTS도 넣지 않습니다. 상위 도메인을 공유하는 다른 사이트에 영향을 줍니다.
 */
export function applySecurityHeaders(response: Response, url: URL): Response {
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=(), usb=(), interest-cohort=()",
  );
  headers.set("X-DNS-Prefetch-Control", "off");
  headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");

  // 상담 접수함에는 고객 개인정보가 있습니다. 캐시와 색인을 모두 막습니다.
  if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) {
    headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    headers.set("Pragma", "no-cache");
    headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
