import { useState } from "react";

import { PhotoEditor } from "./photo-editor";
import {
  photoJoin,
  photoList,
  photoUrl,
  remapPhotoTokens,
  usedPhotoIndexes,
} from "../../lib/content";
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

function tail(body: string) {
  if (!body) return "";
  if (body.endsWith("\n\n")) return "";
  if (body.endsWith("\n")) return "\n";
  return "\n\n";
}

/**
 * 본문 사진. 블로그 쓰듯이 글 사이사이에 사진을 넣습니다.
 *
 * 사진을 고르면 바로 올라가고 글 끝에 [사진N] 표시가 붙습니다.
 * 그 표시를 원하는 문단 사이로 옮기면 사이트에서 그 자리에 사진이 들어갑니다.
 * 올린 사진은 여기서 바로 모자이크 편집할 수 있습니다.
 */
export function BodyPhotos({
  photos,
  body,
  password,
  onChange,
}: {
  photos: string;
  body: string;
  password: string;
  onChange: (next: { photos: string; body: string }) => void;
}) {
  const keys = photoList(photos);
  const [busy, setBusy] = useState(0);
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState<number | null>(null);

  const usedRaw = usedPhotoIndexes(body).filter((n) => Boolean(keys[n]));
  const used = usedRaw.filter((n, i) => usedRaw.indexOf(n) === i);
  const unused = keys.map((_, i) => i).filter((i) => !used.includes(i));

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    const room = MAX_PHOTOS - keys.length;
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
    if (!added.length) return;
    const tokens = added.map((_, i) => `[사진${keys.length + i + 1}]`).join("\n\n");
    onChange({
      photos: photoJoin([...keys, ...added]),
      body: `${body}${tail(body)}${tokens}\n\n`,
    });
    if (files.length > room) {
      setErr(`앞의 ${room}장만 올렸습니다. 한 건에 최대 ${MAX_PHOTOS}장입니다.`);
    }
  }

  /** 이미 올려 둔 사진을 글 끝에 한 번 더 넣습니다. */
  function insert(n: number) {
    onChange({ photos, body: `${body}${tail(body)}[사진${n + 1}]\n\n` });
  }

  /** 표시만 지웁니다. 사진은 남아서 글 위 사진첩에 나옵니다. */
  function dropFromBody(n: number) {
    const re = new RegExp(`\\[사진\\s*${n + 1}\\]`, "g");
    onChange({ photos, body: body.replace(re, "").replace(/\n{3,}/g, "\n\n") });
  }

  /** 사진 자체를 지웁니다. 뒤 번호들이 한 칸씩 당겨지므로 본문 표시도 같이 고쳐 줍니다. */
  function removeWholly(n: number) {
    const next = keys.filter((_, i) => i !== n);
    const map = keys.map((k, i) => (i === n ? -1 : next.indexOf(k)));
    onChange({ photos: photoJoin(next), body: remapPhotoTokens(body, map) });
  }

  async function finishEdit(blob: Blob) {
    const i = editing;
    if (i === null) return;
    setEditing(null);
    setBusy(1);
    try {
      const key = await uploadBlob(blob, password);
      const next = [...keys];
      next[i] = key;
      onChange({ photos: photoJoin(next), body });
    } catch {
      setErr("편집한 사진을 저장하지 못했습니다.");
    } finally {
      setBusy(0);
    }
  }

  return (
    <div className="t-bp">
      <div className="t-bp-hd">본문에 넣을 사진</div>

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => void pick(e)}
        disabled={busy > 0 || keys.length >= MAX_PHOTOS}
      />
      <p className="t-small" style={{ marginTop: 6 }}>
        {busy > 0
          ? `올리는 중입니다. ${busy}장 남았습니다.`
          : "사진을 고르면 바로 올라가고 글 맨 끝에 [사진1] 같은 표시가 붙습니다. 그 표시를 원하는 문단 사이로 옮기면 사이트에서 그 자리에 사진이 들어갑니다."}
      </p>
      {err ? (
        <p className="t-small" style={{ color: "var(--t-notice)" }}>
          {err}
        </p>
      ) : null}

      {used.length > 0 ? (
        <>
          <div className="t-bp-sub">본문에 들어간 사진 {used.length}장</div>
          <div className="t-bp-grid">
            {used.map((n) => (
              <div className="t-bp-i" key={`used-${n}`}>
                <div className="t-bp-th">
                  <img src={photoUrl(keys[n])} alt={`본문 사진 ${n + 1}`} />
                  <span className="t-bp-tag">[사진{n + 1}]</span>
                </div>
                <div className="t-bp-btns">
                  <button type="button" style={mini} onClick={() => setEditing(n)}>
                    편집 · 모자이크
                  </button>
                  <button type="button" style={mini} onClick={() => dropFromBody(n)}>
                    본문에서 빼기
                  </button>
                  <button
                    type="button"
                    style={{ ...mini, color: "var(--t-notice)" }}
                    onClick={() => {
                      if (!window.confirm("이 사진을 아주 지울까요?")) return;
                      removeWholly(n);
                    }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {unused.length > 0 ? (
        <>
          <div className="t-bp-sub">사진첩에 있는 사진 넣기</div>
          <div className="t-ins-row">
            {unused.map((n) => (
              <button
                type="button"
                key={`un-${n}`}
                className="t-ins-b"
                onClick={() => insert(n)}
              >
                <img src={photoUrl(keys[n])} alt="" />
                <span>사진 {n + 1}</span>
              </button>
            ))}
          </div>
          <p className="t-small" style={{ marginTop: 7 }}>
            본문에 넣지 않은 사진은 글 위 사진첩에 그대로 나옵니다.
          </p>
        </>
      ) : null}

      {editing !== null && keys[editing] ? (
        <PhotoEditor
          src={photoUrl(keys[editing])}
          onCancel={() => setEditing(null)}
          onDone={(blob) => void finishEdit(blob)}
        />
      ) : null}
    </div>
  );
}
