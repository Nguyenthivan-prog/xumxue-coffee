import { NextResponse } from "next/server";
import { ROOMS, formatHour, formatVND } from "@/lib/config";
import type { BookingRequest, BookingResponse } from "@/lib/types";
import {
  createBookingEvent,
  getBusyHours,
  isCalendarConfigured,
} from "@/lib/google-calendar";
import { sendBookingConfirmation } from "@/lib/email";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<BookingRequest>;

  const { roomId, date, hours, customerName, customerPhone, customerEmail, note } =
    body;

  if (!roomId || !ROOMS[roomId]) {
    return NextResponse.json(
      { ok: false, message: "Phòng không hợp lệ" } satisfies BookingResponse,
      { status: 400 }
    );
  }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { ok: false, message: "Ngày không hợp lệ" } satisfies BookingResponse,
      { status: 400 }
    );
  }
  if (!Array.isArray(hours) || hours.length === 0) {
    return NextResponse.json(
      { ok: false, message: "Chưa chọn khung giờ" } satisfies BookingResponse,
      { status: 400 }
    );
  }
  if (!customerName || !customerPhone) {
    return NextResponse.json(
      {
        ok: false,
        message: "Vui lòng nhập tên và số điện thoại",
      } satisfies BookingResponse,
      { status: 400 }
    );
  }

  const sortedHours = [...hours].sort((a, b) => a - b);
  for (let i = 1; i < sortedHours.length; i++) {
    if (sortedHours[i] !== sortedHours[i - 1] + 1) {
      return NextResponse.json(
        {
          ok: false,
          message: "Các khung giờ phải liên tiếp nhau",
        } satisfies BookingResponse,
        { status: 400 }
      );
    }
  }

  const room = ROOMS[roomId];
  const total = sortedHours.length * room.pricePerHour;
  const startStr = formatHour(sortedHours[0]);
  const endStr = formatHour(sortedHours[sortedHours.length - 1] + 1);

  const summary = `[${room.shortName}] ${customerName}`;
  const description = [
    `Khách: ${customerName}`,
    `SĐT: ${customerPhone}`,
    customerEmail ? `Email: ${customerEmail}` : null,
    `Phòng: ${room.name}`,
    `Khung giờ: ${startStr} – ${endStr}`,
    `Tổng tiền: ${formatVND(total)}`,
    note ? `Ghi chú: ${note}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  if (!isCalendarConfigured()) {
    console.info("[booking] (mock — calendar chưa cấu hình)", {
      roomId,
      date,
      hours: sortedHours,
      customerName,
      customerPhone,
      total,
    });
    return NextResponse.json({
      ok: true,
      eventId: "mock-" + Date.now(),
      message: "Đã ghi nhận (chế độ thử nghiệm — chưa kết nối Google Calendar)",
    } satisfies BookingResponse);
  }

  // Re-check busy ngay trước khi insert để ngăn double-booking
  // (race condition: 2 người cùng chọn 1 khung giờ trước khi ai submit)
  const busyHours = await getBusyHours(roomId, date);
  if (busyHours) {
    const conflict = sortedHours.find((h) => busyHours.has(h));
    if (conflict !== undefined) {
      return NextResponse.json(
        {
          ok: false,
          message: `Khung giờ ${formatHour(conflict)} vừa được đặt bởi khách khác. Vui lòng chọn khung giờ khác.`,
        } satisfies BookingResponse,
        { status: 409 }
      );
    }
  }

  const result = await createBookingEvent({
    roomId,
    date,
    hours: sortedHours,
    summary,
    description,
  });

  if (!result) {
    return NextResponse.json(
      {
        ok: false,
        message: "Không tạo được lịch — vui lòng thử lại sau",
      } satisfies BookingResponse,
      { status: 500 }
    );
  }

  // Gửi email xác nhận nếu khách điền email. Không block response nếu email fail —
  // booking đã ghi vào Calendar, đó là source of truth.
  if (customerEmail) {
    sendBookingConfirmation({
      to: customerEmail,
      customerName: customerName!,
      customerPhone: customerPhone!,
      roomId,
      date,
      hours: sortedHours,
      total,
    })
      .then((r) => {
        if (!r.ok) console.warn("[email] send failed:", r.error);
      })
      .catch((e) => console.error("[email] send threw:", e));
  }

  return NextResponse.json({
    ok: true,
    eventId: result.eventId,
  } satisfies BookingResponse);
}
