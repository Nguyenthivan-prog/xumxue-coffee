import { NextResponse } from "next/server";
import { ROOMS, getHourSlots } from "@/lib/config";
import type { RoomId } from "@/lib/config";
import { getBusyHours, isCalendarConfigured } from "@/lib/google-calendar";
import type { SlotsResponse } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("roomId") as RoomId | null;
  const date = searchParams.get("date");

  if (!roomId || !ROOMS[roomId]) {
    return NextResponse.json({ error: "Invalid roomId" }, { status: 400 });
  }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const hours = getHourSlots();
  const busy = isCalendarConfigured() ? await getBusyHours(roomId, date) : null;

  const now = new Date();
  const todayStr = new Date(now.getTime() + 7 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const currentHourVN = now.getUTCHours() + 7;

  const response: SlotsResponse = {
    date,
    roomId,
    slots: hours.map((hour) => {
      const isPast = date < todayStr || (date === todayStr && hour <= currentHourVN);
      const isBusy = busy?.has(hour) ?? false;
      return { hour, available: !isPast && !isBusy };
    }),
  };

  return NextResponse.json(response);
}
