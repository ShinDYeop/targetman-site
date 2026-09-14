/**
 * 휴대폰 사진은 보통 4MB가 넘습니다. 올리기 전에 브라우저에서 줄여서
 * 업로드 시간과 저장 용량을 아끼고, 사이트 로딩도 빠르게 유지합니다.
 */
const MAX_EDGE = 1600;
const QUALITY = 0.82;

export async function shrinkImage(file: File): Promise<Blob> {
  if (typeof window === "undefined") return file;
  if (!file.type.startsWith("image/")) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", QUALITY),
    );
    if (!blob) return file;
    return blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

export async function uploadPhoto(file: File, password: string): Promise<string> {
  const blob = await shrinkImage(file);
  const type = blob.type || "image/jpeg";
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": type, "x-admin-password": password },
    body: blob,
  });
  const data = (await res.json()) as { ok?: boolean; key?: string; reason?: string };
  if (!res.ok || !data.ok || !data.key) {
    throw new Error(data.reason ?? "upload_failed");
  }
  return data.key;
}
