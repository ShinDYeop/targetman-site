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

/** 이미 줄여 둔 blob을 그대로 올립니다. 사진 편집기 결과물에 씁니다. */
export async function uploadBlob(blob: Blob, password: string): Promise<string> {
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

export async function uploadPhoto(file: File, password: string): Promise<string> {
  return uploadBlob(await shrinkImage(file), password);
}

/** 화면에 보이는 주소에서 편집용 캔버스를 만듭니다. 같은 도메인이라 그대로 읽힙니다. */
export async function canvasFromUrl(url: string): Promise<HTMLCanvasElement> {
  const img = new Image();
  img.decoding = "async";
  img.src = url;
  await img.decode();
  const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("encode_failed"))),
      "image/jpeg",
      0.85,
    );
  });
}

export function copyCanvas(src: HTMLCanvasElement): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = src.width;
  out.height = src.height;
  out.getContext("2d")?.drawImage(src, 0, 0);
  return out;
}

/**
 * 지정한 사각형을 블록 단위로 뭉갭니다. 블록마다 가운데 픽셀 색으로 통째로 칠해
 * 번호판이나 얼굴을 복원할 수 없게 만듭니다.
 */
export function pixelateRect(
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  w: number,
  h: number,
  block: number,
) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  const x0 = Math.max(0, Math.floor(x));
  const y0 = Math.max(0, Math.floor(y));
  const x1 = Math.min(canvas.width, Math.ceil(x + w));
  const y1 = Math.min(canvas.height, Math.ceil(y + h));
  const rw = x1 - x0;
  const rh = y1 - y0;
  if (rw <= 0 || rh <= 0) return;

  const src = ctx.getImageData(x0, y0, rw, rh);
  const step = Math.max(2, Math.floor(block));
  for (let by = 0; by < rh; by += step) {
    for (let bx = 0; bx < rw; bx += step) {
      const cw = Math.min(step, rw - bx);
      const ch = Math.min(step, rh - by);
      let r = 0;
      let g = 0;
      let b = 0;
      let n = 0;
      for (let dy = 0; dy < ch; dy += 2) {
        for (let dx = 0; dx < cw; dx += 2) {
          const i = ((by + dy) * rw + (bx + dx)) * 4;
          r += src.data[i];
          g += src.data[i + 1];
          b += src.data[i + 2];
          n += 1;
        }
      }
      if (!n) continue;
      ctx.fillStyle = `rgb(${Math.round(r / n)},${Math.round(g / n)},${Math.round(b / n)})`;
      ctx.fillRect(x0 + bx, y0 + by, cw, ch);
    }
  }
}

/** 시계 방향 90도 회전. */
export function rotateCanvas(src: HTMLCanvasElement): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = src.height;
  out.height = src.width;
  const ctx = out.getContext("2d");
  if (ctx) {
    ctx.translate(out.width, 0);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(src, 0, 0);
  }
  return out;
}

export function cropCanvas(
  src: HTMLCanvasElement,
  x: number,
  y: number,
  w: number,
  h: number,
): HTMLCanvasElement {
  const x0 = Math.max(0, Math.round(x));
  const y0 = Math.max(0, Math.round(y));
  const cw = Math.max(1, Math.min(Math.round(w), src.width - x0));
  const ch = Math.max(1, Math.min(Math.round(h), src.height - y0));
  const out = document.createElement("canvas");
  out.width = cw;
  out.height = ch;
  out.getContext("2d")?.drawImage(src, x0, y0, cw, ch, 0, 0, cw, ch);
  return out;
}
