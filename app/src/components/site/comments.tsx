import "./comments.css";

import { useRef, useState } from "react";

import { submitComment } from "../../lib/api/comment.functions";
import type { Comment } from "../../lib/content";

function when(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${kst.getUTCFullYear()}.${p(kst.getUTCMonth() + 1)}.${p(kst.getUTCDate())}`;
}

const REASON: Record<string, string> = {
  too_fast: "잠시 후 다시 눌러 주세요.",
  rate: "댓글이 너무 자주 등록되고 있습니다. 잠시 후 다시 시도해 주세요.",
  invalid: "성함과 내용을 확인해 주세요.",
  no_review: "이 후기에는 댓글을 달 수 없습니다.",
};

/**
 * 후기 한 건에 달리는 고객 댓글.
 * 바로 게시되지 않고 담당자 확인 뒤 올라갑니다. 그 사실을 화면에 그대로 적습니다.
 */
export function Comments({ reviewId, items }: { reviewId: number; items: Comment[] }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [hp, setHp] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  const startedAt = useRef(0);

  function start() {
    startedAt.current = Date.now();
    setState("idle");
    setMsg("");
    setOpen(true);
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    try {
      const res = await submitComment({
        data: { reviewId, name, body, hp, elapsedMs: Date.now() - startedAt.current },
      });
      if (res.ok) {
        setName("");
        setBody("");
        setOpen(false);
        setState("done");
      } else {
        setState("error");
        setMsg(REASON[res.reason] ?? "등록하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      }
    } catch {
      setState("error");
      setMsg("등록하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    }
  }

  return (
    <div className="t-cm">
      <div className="t-cm-hd">고객 댓글 {items.length > 0 ? items.length : ""}</div>

      {items.length > 0 ? (
        <div className="t-cm-list">
          {items.map((c) => (
            <div className="t-cm-i" key={c.id}>
              <div className="t-cm-who">
                <b>{c.name}</b>
                <span>{when(c.createdAt)}</span>
              </div>
              <p className="t-cm-body">{c.body}</p>
            </div>
          ))}
        </div>
      ) : null}

      {state === "done" ? (
        <p className="t-cm-note" data-k="good">
          댓글을 남겨 주셔서 감사합니다. 담당자 확인 후 게시됩니다.
        </p>
      ) : open ? (
        <form className="t-cm-form" onSubmit={send}>
          <input
            className="t-cm-hp"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            placeholder="회사명"
            value={hp}
            onChange={(e) => setHp(e.target.value)}
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="성함 (김동엽)"
            maxLength={20}
            required
            aria-label="성함"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="차량 타시면서 느낀 점을 편하게 남겨 주세요."
            maxLength={500}
            required
            aria-label="댓글 내용"
          />
          <div className="t-cm-row">
            <button className="t-cm-send" type="submit" disabled={state === "sending"}>
              {state === "sending" ? "등록 중" : "댓글 남기기"}
            </button>
            <button type="button" className="t-cm-cancel" onClick={() => setOpen(false)}>
              취소
            </button>
          </div>
          {state === "error" ? (
            <p className="t-cm-note" data-k="bad">
              {msg}
            </p>
          ) : null}
          <p className="t-cm-note">
            성함은 <b>김○○</b> 처럼 성만 보이게 가려서 올라갑니다. 담당자가 확인한 뒤
            게시되므로 바로 보이지는 않습니다.
          </p>
        </form>
      ) : (
        <button type="button" className="t-cm-open" onClick={start}>
          댓글 남기기
        </button>
      )}
    </div>
  );
}
