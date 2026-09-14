import { createFileRoute } from "@tanstack/react-router";

import { bindings } from "../lib/bindings.server";

/** R2에 올린 사진을 그대로 내보냅니다. 키 형식을 벗어난 요청은 거절합니다. */
const KEY_OK = /^img\/[A-Za-z0-9._-]{1,80}$/;

export const Route = createFileRoute("/api/img")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const key = new URL(request.url).searchParams.get("k") ?? "";
        if (!KEY_OK.test(key)) return new Response("Not found", { status: 404 });

        const { STORAGE } = bindings();
        if (!STORAGE) return new Response("Not found", { status: 404 });

        const object = await STORAGE.get(key);
        if (!object) return new Response("Not found", { status: 404 });

        return new Response(object.body as unknown as BodyInit, {
          headers: {
            "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
            "Cache-Control": "public, max-age=31536000, immutable",
            "X-Content-Type-Options": "nosniff",
          },
        });
      },
    },
  },
});
