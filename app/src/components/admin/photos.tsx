import { useState } from "react";

import { PhotoEditor } from "./photo-editor";
import { photoJoin, photoList, photoUrl } from "../../lib/content";
import { uploadBlob, uploadPhoto } from "../../lib/image";

const MAX_PHOTOS = 12;

const mini: React.CSSProperties = {
  fontSize: 11.5,
  fontWeight: 700,
  padding: "5px 9px",
  borderRadius: 7,
  border: "1px solid var(--t-line-2)",
  background: "var(--t-surface)",
  color: "var(--t-ink-2)",
  cursor: "pointer",
  lineHeight: 1.2,
};

export function MultiPhotoPicker({
  value,
  password,
  onChange,
  label = "사진",
  hint = "휴대폰에서 바로 찍어 올리셔도 됩니다. 여러 장 한 번에 고를 수 있고, 올린 뒤 편집에서 번호판을 모자이크하세요.",
}: {
  value: string;
  password: string;
  onChange: (next: string) => void;
  label?: string;
  hint?: string;
}) {
  const list = photoList(value);
  const [busy, setBusy] = useState(0);
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState<number | null>(null);

  function replaceAt(i: number, key: string) {
    const next = [...list];
    next[i] = key;
    onChange(photoJoin(next));
  }

  function removeAt(i: number) {
    onChange(photoJoin(list.filter((_, k) => k !== i)));
  }

  function moveAt(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(photoJoin(next));
  }

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    const room = MAX_PHOTOS - list.length;
    if (room <= 0) {
      setErr(`사진은 한 건에 최대 ${MAX_PHOTOS}장까지 올릴 수 있습니다.`);
      return;
    }
    setErr("");
    const take = files.slice(0, room);
    const added: string[] = [];
    for (let i = 0; i < take.length; i += 1) {
      setBusy(take.length - i);
      try {
        added.push(await uploadPhoto(take[i], password));
      } catch {
        setErr("일부 사진을 올리지 못했습니다. 다시 시도해 주세요.");
      }
    }
    setBusy(0);
    if (added.length) onChange(photoJoin([...list, ...added]));
    if (files.length > room) setErr(`앞의 ${room}장만 올렸습니다. 한 건에 최대 ${MAX_PHOTOS}장입니다.`);
  }

  async function finishEdit(blob: Blob) {
    const i = editing;
    if (i === null) return;
    setEditing(null);
    setBusy(1);
    try {
      replaceAt(i, await uploadBlob(blob, password));
    } catch {
      setErr("편집한 사진을 저장하지 못했습니다.");
    } finally {
      setBusy(0);
    }
  }

  return (
    <div className="t-field">
      <label>
        {label} {list.length ? `· ${list.length}장` : ""}
      </label>

      {list.length ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 10,
            marginBottom: 10,
          }}
        >
          {list.map((key, i) => (
            <div
              key={`${key}-${i}`}
              style={{
                border: "1px solid var(--t-line)",
                borderRadius: 10,
                overflow: "hidden",
                background: "var(--t-surface-2)",
              }}
            >
              <div style={{ position: "relative", aspectRatio: "4 / 3", background: "#000" }}>
                <img
                  src={photoUrl(key)}
                  alt={`사진 ${i + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
                {i === 0 ? (
                  <span
                    style={{
                      position: "absolute",
                      left: 6,
                      top: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 7px",
                      borderRadius: 6,
                      background: "var(--t-accent)",
                      color: "#fff",
                    }}
                  >
                    대표
                  </span>
                ) : null}
              </div>
              <div style={{ display: "flex", gap: 5, padding: 7, flexWrap: "wrap" }}>
                <button type="button" style={mini} onClick={() => setEditing(i)}>
                  편집
                </button>
                <button type="button" style={mini} onClick={() => moveAt(i, -1)} disabled={i === 0}>
                  ←
                </button>
                <button
                  type="button"
                  style={mini}
                  onClick={() => moveAt(i, 1)}
                  disabled={i === list.length - 1}
                >
                  →
                </button>
                <button
                  type="button"
                  style={{ ...mini, color: "var(--t-notice)", marginLeft: "auto" }}
                  onClick={() => removeAt(i)}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={pick}
        disabled={busy > 0 || list.length >= MAX_PHOTOS}
      />
      <p className="t-small">{busy > 0 ? `올리는 중입니다. ${busy}장 남았습니다.` : hint}</p>
      {err ? (
        <p className="t-small" style={{ color: "var(--t-notice)" }}>
          {err}
        </p>
      ) : null}

      {editing !== null && list[editing] ? (
        <PhotoEditor
          src={photoUrl(list[editing])}
          onCancel={() => setEditing(null)}
          onDone={(blob) => void finishEdit(blob)}
        />
      ) : null}
    </div>
  );
}
