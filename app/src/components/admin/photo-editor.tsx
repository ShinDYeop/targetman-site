import { useEffect, useRef, useState } from "react";

import {
  canvasFromUrl,
  canvasToBlob,
  copyCanvas,
  cropCanvas,
  pixelateRect,
  rotateCanvas,
} from "../../lib/image";

type Tool = "mosaic" | "crop";
type Rect = { x: number; y: number; w: number; h: number };

/** 붓 크기는 사진 긴 변에 대한 비율로 정합니다. 어느 해상도에서나 손가락 굵기와 비슷합니다. */
const BRUSHES: Array<{ key: string; label: string; factor: number }> = [
  { key: "s", label: "가늘게", factor: 0.028 },
  { key: "m", label: "보통", factor: 0.05 },
  { key: "l", label: "굵게", factor: 0.085 },
];

const btn = (on: boolean): React.CSSProperties => ({
  fontSize: 13,
  fontWeight: 700,
  padding: "9px 14px",
  borderRadius: 999,
  border: "none",
  cursor: "pointer",
  background: on ? "#E85A26" : "rgba(255,255,255,0.14)",
  color: "#fff",
  whiteSpace: "nowrap",
});

export function PhotoEditor({
  src,
  onCancel,
  onDone,
}: {
  src: string;
  onCancel: () => void;
  onDone: (blob: Blob) => void;
}) {
  const baseRef = useRef<HTMLCanvasElement | null>(null);
  const viewRef = useRef<HTMLCanvasElement | null>(null);
  const undoRef = useRef<HTMLCanvasElement[]>([]);
  const dragRef = useRef<{ mode: Tool; x: number; y: number } | null>(null);

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [tool, setTool] = useState<Tool>("mosaic");
  const [brush, setBrush] = useState(1);
  const [crop, setCrop] = useState<Rect | null>(null);
  const [canUndo, setCanUndo] = useState(false);

  function redraw(rect: Rect | null) {
    const base = baseRef.current;
    const view = viewRef.current;
    if (!base || !view) return;
    if (view.width !== base.width || view.height !== base.height) {
      view.width = base.width;
      view.height = base.height;
    }
    const ctx = view.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, view.width, view.height);
    ctx.drawImage(base, 0, 0);
    if (rect && rect.w > 2 && rect.h > 2) {
      ctx.save();
      ctx.fillStyle = "rgba(10,14,24,0.55)";
      ctx.beginPath();
      ctx.rect(0, 0, view.width, view.height);
      ctx.rect(rect.x, rect.y, rect.w, rect.h);
      ctx.fill("evenodd");
      ctx.strokeStyle = "#E85A26";
      ctx.lineWidth = Math.max(2, view.width / 220);
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
      ctx.restore();
    }
  }

  useEffect(() => {
    let alive = true;
    canvasFromUrl(src)
      .then((c) => {
        if (!alive) return;
        baseRef.current = c;
        setReady(true);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [src]);

  useEffect(() => {
    if (ready) redraw(null);
  }, [ready]);

  function snapshot() {
    const base = baseRef.current;
    if (!base) return;
    undoRef.current.push(copyCanvas(base));
    if (undoRef.current.length > 12) undoRef.current.shift();
    setCanUndo(true);
  }

  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const view = viewRef.current;
    if (!view) return { x: 0, y: 0 };
    const r = view.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * view.width,
      y: ((e.clientY - r.top) / r.height) * view.height,
    };
  }

  function paint(x: number, y: number) {
    const base = baseRef.current;
    if (!base) return;
    const radius = Math.max(
      8,
      Math.round(Math.max(base.width, base.height) * BRUSHES[brush].factor),
    );
    pixelateRect(base, x - radius, y - radius, radius * 2, radius * 2, Math.max(6, radius / 2.4));
  }

  function onDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!ready) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = point(e);
    if (tool === "mosaic") {
      snapshot();
      dragRef.current = { mode: "mosaic", x: p.x, y: p.y };
      paint(p.x, p.y);
      redraw(null);
    } else {
      dragRef.current = { mode: "crop", x: p.x, y: p.y };
      setCrop(null);
      redraw(null);
    }
  }

  function onMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const d = dragRef.current;
    if (!d) return;
    const p = point(e);
    if (d.mode === "mosaic") {
      paint(p.x, p.y);
      redraw(null);
    } else {
      const r = {
        x: Math.min(d.x, p.x),
        y: Math.min(d.y, p.y),
        w: Math.abs(p.x - d.x),
        h: Math.abs(p.y - d.y),
      };
      setCrop(r);
      redraw(r);
    }
  }

  function onUp() {
    dragRef.current = null;
  }

  function undo() {
    const prev = undoRef.current.pop();
    if (!prev) return;
    baseRef.current = prev;
    setCrop(null);
    setCanUndo(undoRef.current.length > 0);
    redraw(null);
  }

  function rotate() {
    const base = baseRef.current;
    if (!base) return;
    snapshot();
    baseRef.current = rotateCanvas(base);
    setCrop(null);
    redraw(null);
  }

  function applyCrop() {
    const base = baseRef.current;
    if (!base || !crop || crop.w < 8 || crop.h < 8) return;
    snapshot();
    baseRef.current = cropCanvas(base, crop.x, crop.y, crop.w, crop.h);
    setCrop(null);
    redraw(null);
  }

  async function done() {
    const base = baseRef.current;
    if (!base) return;
    setBusy(true);
    try {
      onDone(await canvasToBlob(base));
    } catch {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "#0B1020",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <button type="button" style={btn(false)} onClick={onCancel}>
          취소
        </button>
        <strong style={{ fontSize: 14, marginInline: "auto" }}>사진 편집</strong>
        <button type="button" style={btn(true)} onClick={() => void done()} disabled={busy || !ready}>
          {busy ? "저장 중" : "완료"}
        </button>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 12,
          overflow: "hidden",
        }}
      >
        {failed ? (
          <p style={{ fontSize: 14 }}>사진을 불러오지 못했습니다. 창을 닫고 다시 시도해 주세요.</p>
        ) : (
          <canvas
            ref={viewRef}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              touchAction: "none",
              borderRadius: 8,
              cursor: tool === "crop" ? "crosshair" : "cell",
              background: "#000",
            }}
          />
        )}
      </div>

      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.12)",
          padding: "12px 14px calc(12px + env(safe-area-inset-bottom))",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" style={btn(tool === "mosaic")} onClick={() => { setTool("mosaic"); setCrop(null); redraw(null); }}>
            모자이크
          </button>
          <button type="button" style={btn(tool === "crop")} onClick={() => setTool("crop")}>
            자르기
          </button>
          <button type="button" style={btn(false)} onClick={rotate}>
            회전
          </button>
          <button type="button" style={{ ...btn(false), opacity: canUndo ? 1 : 0.4 }} onClick={undo} disabled={!canUndo}>
            되돌리기
          </button>
        </div>

        {tool === "mosaic" ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, opacity: 0.7 }}>붓 크기</span>
            {BRUSHES.map((b, i) => (
              <button key={b.key} type="button" style={btn(brush === i)} onClick={() => setBrush(i)}>
                {b.label}
              </button>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              style={{ ...btn(true), opacity: crop && crop.w > 8 ? 1 : 0.4 }}
              onClick={applyCrop}
              disabled={!crop || crop.w < 8}
            >
              선택한 부분만 남기기
            </button>
            <span style={{ fontSize: 12, opacity: 0.7 }}>사진 위를 끌어서 남길 범위를 정하세요.</span>
          </div>
        )}

        <p style={{ fontSize: 12, opacity: 0.7, margin: 0, lineHeight: 1.6 }}>
          {tool === "mosaic"
            ? "번호판, 얼굴, 견적표의 고객명과 연락처를 손가락으로 문지르세요. 문지른 부분은 되살릴 수 없게 뭉개집니다."
            : "필요 없는 여백이나 화면 끝의 앱 표시줄을 잘라내세요."}
        </p>
      </div>
    </div>
  );
}
