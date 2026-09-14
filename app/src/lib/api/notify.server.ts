import { env } from "cloudflare:workers";

type NotifyEnv = {
  RESEND_API_KEY?: string;
  OWNER_EMAIL?: string;
  NOTIFY_FROM?: string;
};

export type NotifyResult = { sent: boolean; reason: string };

/**
 * 새 상담이 들어오면 사장님께 메일로 알립니다.
 * 키가 설정되지 않았으면 조용히 넘어갑니다. 알림이 실패해도 접수는 성공해야 합니다.
 */
export async function notifyOwner(subject: string, body: string): Promise<NotifyResult> {
  const e = env as unknown as NotifyEnv;
  if (!e.RESEND_API_KEY || !e.OWNER_EMAIL) {
    return { sent: false, reason: "not_configured" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${e.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: e.NOTIFY_FROM ?? "onboarding@resend.dev",
        to: [e.OWNER_EMAIL],
        subject,
        text: body,
      }),
    });
    return { sent: res.ok, reason: res.ok ? "ok" : `http_${res.status}` };
  } catch {
    return { sent: false, reason: "network" };
  }
}

export function formatNotification(row: {
  kind: string;
  name: string;
  phone: string;
  brand?: string;
  model?: string;
  contractType?: string;
  budget?: string;
  timing?: string;
  callWindow?: string;
  memo?: string;
}) {
  const lines = [
    `[${row.kind}] ${row.name} 님`,
    `연락처 : ${row.phone}`,
  ];
  if (row.brand || row.model) lines.push(`차종 : ${[row.brand, row.model].filter(Boolean).join(" ")}`);
  if (row.contractType) lines.push(`계약형태 : ${row.contractType}`);
  if (row.budget) lines.push(`예산 : ${row.budget}`);
  if (row.timing) lines.push(`인수 시기 : ${row.timing}`);
  if (row.callWindow) lines.push(`연락 가능 시간 : ${row.callWindow}`);
  if (row.memo) lines.push("", "내용 :", row.memo);
  lines.push("", "전체 내역 보기 : /admin");
  return lines.join("\n");
}
