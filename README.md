# 타겟맨 신동엽 — 리스 · 장기렌트 사이트

유튜브 [@targetman777](https://www.youtube.com/@targetman777) 시청자를 상담으로 연결하는 사이트입니다.
출고 후기, 차량별 견적, 견적 요청 접수, 관리자 페이지가 들어 있습니다.

## 무엇으로 돌아가는가

| | |
|---|---|
| 프레임워크 | TanStack Start (React 19, SSR) |
| 실행 환경 | Cloudflare Workers |
| 데이터베이스 | Cloudflare D1 (`DB` 바인딩) — 후기, 견적, 견적요청, 설정 |
| 파일 저장소 | Cloudflare R2 (`STORAGE` 바인딩) — 업로드한 사진 |
| 메일 알림 | Resend |

설정은 전부 `app/wrangler.jsonc` 한 파일에 있습니다.

## 처음 한 번만 하는 설정

```bash
cd app
bun install

# 1) 데이터베이스와 저장소 만들기
bunx wrangler d1 create targetman-db      # 나온 database_id 를 wrangler.jsonc 에 붙여넣기
bunx wrangler r2 bucket create targetman-assets

# 2) 표 만들기 (migrations/ 안의 SQL 을 순서대로 적용)
bunx wrangler d1 migrations apply targetman-db --remote

# 3) 비밀값 넣기 — 저장소에는 절대 안 들어갑니다
bunx wrangler secret put ADMIN_PASSWORD
bunx wrangler secret put OWNER_EMAIL
bunx wrangler secret put RESEND_API_KEY
```

## 배포

```bash
cd app
bun run deploy        # vite build && wrangler deploy
```

GitHub 저장소를 Cloudflare 대시보드의 **Workers → Builds** 에 연결해 두면
`main` 에 push 할 때마다 자동으로 배포됩니다.

## 로컬에서 돌려보기

```bash
cd app
cp .dev.vars.example .dev.vars   # 값을 채워 넣으세요. 이 파일은 git 에 안 올라갑니다.
bun run dev
```

Node 22 이상이 필요합니다 (Vite 7 요구사항). `app/.node-version` 에 적어 뒀습니다.

## 비밀값 관리 원칙

**API 키, 비밀번호, 토큰은 어떤 경우에도 이 저장소에 커밋하지 않습니다.**
전부 `wrangler secret put` 으로 넣고, 코드에서는 `*.server.ts` 파일 안에서만 읽습니다.
`.gitignore` 가 `.env*`, `.dev.vars`, `*.pem`, `*.key` 를 막고 있습니다.
자세한 내용은 [SECURITY.md](./SECURITY.md) 참고.

## 구조

```
app/src/routes/          페이지 (index, reviews, estimates, quote, admin, stock…)
app/src/components/site/ 공개 화면 부품 (헤더, 카드, 사진 스트립)
app/src/components/admin/ 관리자 전용 (사진 여러 장 업로드, 사진 편집기)
app/src/lib/api/         서버 함수 — DB 읽기/쓰기, 인증, 스팸 차단, 메일 알림
app/migrations/          D1 스키마. 추가만 하고 고치지 않습니다.
```

## 관리자 페이지

`/admin` 에서 비밀번호로 들어갑니다. 접수함 / 후기 / 차량별 견적 / 재고(숨김) / 설정 다섯 탭.
사진은 여러 장 올릴 수 있고, 올린 뒤 편집에서 모자이크 · 자르기 · 회전이 됩니다.
번호판과 견적표의 고객 정보는 반드시 가리고 공개하세요.
