import { createFileRoute } from "@tanstack/react-router";

import { requireAdminHeader } from "../lib/api/auth.server";
import { bindings } from "../lib/bindings.server";

const ALLOWED = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
const MAX_BYTES = 8 * 1024 * 1024;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export const Route = createFileRoute("/api/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await requireAdminHeader(request);
        if (!auth.ok) return json({ ok: false, reason: auth.reason }, 401);

        const type = (request.headers.get("content-type") ?? "").split(";")[0].trim();
        const ext = ALLOWED.get(type);
        if (!ext) return json({ ok: false, reason: "unsupported_type" }, 415);

        const declared = Number(request.headers.get("content-length") ?? "0");
        if (declared > MAX_BYTES) return json({ ok: false, reason: "too_large" }, 413);

        const bytes = new Uint8Array(await request.arrayBuffer());
        if (bytes.byteLength === 0) return json({ ok: false, reason: "empty" }, 400);
        if (bytes.byteLength > MAX_BYTES) return json({ ok: false, reason: "too_large" }, 413);

        const { STORAGE } = bindings();
        if (!STORAGE) return json({ ok: false, reason: "storage_unavailable" }, 500);

        const key = `img/${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
        await STORAGE.put(key, bytes, { httpMetadata: { contentType: type } });
        return json({ ok: true, key });
      },
    },
  },
});
