import { createFileRoute } from "@tanstack/react-router";

import { bindings } from "../lib/bindings.server";

/** D1에 넣어 둔 사진을 그대로 내보냅니다. 키 형식을 벗어난 요청은 거절합니다. */
const KEY_OK = /^img\/[A-Za-z0-9._-]{1,80}$/;

type PhotoRow = { mime: string; bytes: ArrayBuffer | Uint8Array | number[] };

/** D1은 BLOB을 런타임에 따라 다른 모양으로 돌려줍니다. 어느 쪽이든 받습니다. */
function toBody(raw: PhotoRow["bytes"]): Uint8Array {
  if (raw instanceof Uint8Array) return raw;
  if (raw instanceof ArrayBuffer) return new Uint8Array(raw);
  return new Uint8Array(raw);
}

export const Route = createFileRoute("/api/img")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const key = new URL(request.url).searchParams.get("k") ?? "";
        if (!KEY_OK.test(key)) return new Response("Not found", { status: 404 });

        const { DB } = bindings();
        if (!DB) return new Response("Not found", { status: 404 });

        const row = await DB.prepare("SELECT mime, bytes FROM photos WHERE key = ?")
          .bind(key)
          .first<PhotoRow>();
        if (!row) return new Response("Not found", { status: 404 });

        const body = toBody(row.bytes);
        return new Response(body as unknown as BodyInit, {
          headers: {
            "Content-Type": row.mime || "application/octet-stream",
            "Content-Length": String(body.byteLength),
            "Cache-Control": "public, max-age=31536000, immutable",
            "X-Content-Type-Options": "nosniff",
          },
        });
      },
    },
  },
});
