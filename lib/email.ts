import { Resend } from "resend";
import {
  CAFE_INFO,
  ROOMS,
  formatHour,
  formatVND,
  type RoomId,
} from "./config";

const DEFAULT_FROM = "Xum Xuê Coffee <onboarding@resend.dev>";

export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function dayName(date: string): string {
  const d = new Date(date + "T00:00:00Z");
  const names = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];
  return `${names[d.getUTCDay()]}, ${d.getUTCDate()}/${d.getUTCMonth() + 1}/${d.getUTCFullYear()}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildHtml(args: {
  customerName: string;
  customerPhone: string;
  roomId: RoomId;
  date: string;
  hours: number[];
  total: number;
}): string {
  const room = ROOMS[args.roomId];
  const start = formatHour(args.hours[0]);
  const end = formatHour(args.hours[args.hours.length - 1] + 1);
  const dateLabel = dayName(args.date);

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Xác nhận đặt phòng</title>
</head>
<body style="margin:0;padding:0;background:#faf3e3;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#3d2418">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#faf3e3;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background:#f5efe3;border-radius:16px;overflow:hidden;border:1px solid rgba(196,153,104,0.3)">
        <tr><td style="padding:32px 32px 16px;text-align:center">
          <p style="margin:0 0 8px;color:#9c6a3b;font-size:11px;letter-spacing:0.3em;text-transform:uppercase">Xum Xuê Coffee</p>
          <h1 style="margin:0;font-size:22px;color:#3d2418;font-weight:600">Đã ghi nhận đặt phòng</h1>
        </td></tr>
        <tr><td style="padding:8px 32px 24px">
          <p style="margin:0 0 16px;color:#6b4423;line-height:1.6">
            Chào <strong style="color:#3d2418">${escapeHtml(args.customerName)}</strong>, cảm ơn bạn đã đặt phòng tại Xum Xuê Coffee. Dưới đây là chi tiết đặt phòng của bạn:
          </p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#faf3e3;border:1px solid rgba(196,153,104,0.3);border-radius:12px">
            <tr><td style="padding:16px 20px;border-bottom:1px solid rgba(196,153,104,0.2)">
              <p style="margin:0 0 4px;color:#6b4423;font-size:11px;letter-spacing:0.1em;text-transform:uppercase">Phòng</p>
              <p style="margin:0;color:#3d2418;font-weight:600">${escapeHtml(room.name)} <span style="color:#6b4423;font-weight:400">· ${escapeHtml(room.capacity)}</span></p>
            </td></tr>
            <tr><td style="padding:16px 20px;border-bottom:1px solid rgba(196,153,104,0.2)">
              <p style="margin:0 0 4px;color:#6b4423;font-size:11px;letter-spacing:0.1em;text-transform:uppercase">Thời gian</p>
              <p style="margin:0;color:#3d2418;font-weight:600">${dateLabel}</p>
              <p style="margin:4px 0 0;color:#3d2418">${start} – ${end} (${args.hours.length} giờ)</p>
            </td></tr>
            <tr><td style="padding:16px 20px;border-bottom:1px solid rgba(196,153,104,0.2)">
              <p style="margin:0 0 4px;color:#6b4423;font-size:11px;letter-spacing:0.1em;text-transform:uppercase">Số điện thoại</p>
              <p style="margin:0;color:#3d2418">${escapeHtml(args.customerPhone)}</p>
            </td></tr>
            <tr><td style="padding:16px 20px;background:rgba(196,153,104,0.08)">
              <p style="margin:0 0 4px;color:#6b4423;font-size:11px;letter-spacing:0.1em;text-transform:uppercase">Tổng tiền</p>
              <p style="margin:0;color:#3d2418;font-size:20px;font-weight:600">${escapeHtml(formatVND(args.total))}</p>
              <p style="margin:4px 0 0;color:#6b4423;font-size:13px">${formatVND(room.pricePerHour)} × ${args.hours.length} giờ</p>
            </td></tr>
          </table>
          <p style="margin:24px 0 8px;color:#6b4423;line-height:1.6;font-size:14px">
            Quán sẽ liên hệ với bạn qua số điện thoại trên để xác nhận và hướng dẫn thanh toán.
          </p>
        </td></tr>
        <tr><td style="padding:20px 32px;background:#3d2418;color:#faf3e3">
          <p style="margin:0 0 6px;font-weight:600">${escapeHtml(CAFE_INFO.name)}</p>
          <p style="margin:0 0 4px;font-size:13px;color:rgba(250,243,227,0.8)">${escapeHtml(CAFE_INFO.address)}</p>
          <p style="margin:0;font-size:13px;color:rgba(250,243,227,0.8)">${escapeHtml(CAFE_INFO.phone)} · ${escapeHtml(CAFE_INFO.domain)}</p>
          <p style="margin:8px 0 0;font-size:12px;color:rgba(250,243,227,0.5)">Mở cửa hằng ngày · 8:00 – 24:00</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildPlainText(args: {
  customerName: string;
  customerPhone: string;
  roomId: RoomId;
  date: string;
  hours: number[];
  total: number;
}): string {
  const room = ROOMS[args.roomId];
  const start = formatHour(args.hours[0]);
  const end = formatHour(args.hours[args.hours.length - 1] + 1);
  return [
    `Chào ${args.customerName},`,
    ``,
    `Cảm ơn bạn đã đặt phòng tại Xum Xuê Coffee. Chi tiết đặt phòng:`,
    ``,
    `Phòng: ${room.name} (${room.capacity})`,
    `Thời gian: ${dayName(args.date)} · ${start} – ${end} (${args.hours.length} giờ)`,
    `Số điện thoại: ${args.customerPhone}`,
    `Tổng tiền: ${formatVND(args.total)} (${formatVND(room.pricePerHour)}/giờ × ${args.hours.length} giờ)`,
    ``,
    `Quán sẽ liên hệ với bạn để xác nhận và hướng dẫn thanh toán.`,
    ``,
    `--`,
    `${CAFE_INFO.name}`,
    `${CAFE_INFO.address}`,
    `${CAFE_INFO.phone} · ${CAFE_INFO.domain}`,
    `Mở cửa hằng ngày 8:00 – 24:00`,
  ].join("\n");
}

export async function sendBookingConfirmation(args: {
  to: string;
  customerName: string;
  customerPhone: string;
  roomId: RoomId;
  date: string;
  hours: number[];
  total: number;
}): Promise<{ ok: boolean; error?: string }> {
  const client = getClient();
  if (!client) {
    console.info("[email] (mock — RESEND_API_KEY chưa cấu hình)", {
      to: args.to,
      subject: "Xác nhận đặt phòng — Xum Xuê Coffee",
    });
    return { ok: false, error: "not_configured" };
  }

  const from = process.env.RESEND_FROM || DEFAULT_FROM;
  const html = buildHtml(args);
  const text = buildPlainText(args);

  try {
    const result = await client.emails.send({
      from,
      to: args.to,
      subject: "Xác nhận đặt phòng — Xum Xuê Coffee",
      html,
      text,
    });
    if (result.error) {
      return { ok: false, error: result.error.message };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "unknown" };
  }
}
