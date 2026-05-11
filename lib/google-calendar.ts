import { google, type calendar_v3 } from "googleapis";
import type { RoomId } from "./config";
import { OPENING_HOUR, CLOSING_HOUR } from "./config";

const VN_TZ = "Asia/Ho_Chi_Minh";
const VN_OFFSET = "+07:00";

function readCredentials(): { client_email: string; private_key: string } | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as {
      client_email?: string;
      private_key?: string;
    };
    if (!parsed.client_email || !parsed.private_key) return null;
    return {
      client_email: parsed.client_email,
      private_key: parsed.private_key.replace(/\\n/g, "\n"),
    };
  } catch {
    return null;
  }
}

export function isCalendarConfigured(): boolean {
  return readCredentials() !== null;
}

export function getCalendarIdForRoom(roomId: RoomId): string | null {
  if (roomId === "large") return process.env.CALENDAR_ID_LARGE ?? null;
  return process.env.CALENDAR_ID_SMALL ?? null;
}

function getClient(): calendar_v3.Calendar | null {
  const creds = readCredentials();
  if (!creds) return null;
  const auth = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
  return google.calendar({ version: "v3", auth });
}

export function isoForDayHour(date: string, hour: number): string {
  const extraDays = Math.floor(hour / 24);
  const h = hour % 24;
  let useDate = date;
  if (extraDays > 0) {
    const d = new Date(date + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + extraDays);
    useDate = d.toISOString().slice(0, 10);
  }
  const hh = String(h).padStart(2, "0");
  return `${useDate}T${hh}:00:00${VN_OFFSET}`;
}

export async function getBusyHours(
  roomId: RoomId,
  date: string
): Promise<Set<number> | null> {
  const client = getClient();
  const calendarId = getCalendarIdForRoom(roomId);
  if (!client || !calendarId) return null;

  const timeMin = isoForDayHour(date, OPENING_HOUR);
  const timeMax = isoForDayHour(date, CLOSING_HOUR);

  const res = await client.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      timeZone: VN_TZ,
      items: [{ id: calendarId }],
    },
  });

  const busy = new Set<number>();
  const busyRanges = res.data.calendars?.[calendarId]?.busy ?? [];
  for (const range of busyRanges) {
    if (!range.start || !range.end) continue;
    const startMs = new Date(range.start).getTime();
    const endMs = new Date(range.end).getTime();
    for (let h = OPENING_HOUR; h < CLOSING_HOUR; h++) {
      const slotStart = new Date(isoForDayHour(date, h)).getTime();
      const slotEnd = slotStart + 60 * 60 * 1000;
      if (slotStart < endMs && slotEnd > startMs) busy.add(h);
    }
  }
  return busy;
}

export async function createBookingEvent(args: {
  roomId: RoomId;
  date: string;
  hours: number[];
  summary: string;
  description: string;
}): Promise<{ eventId: string } | null> {
  const client = getClient();
  const calendarId = getCalendarIdForRoom(args.roomId);
  if (!client || !calendarId) return null;

  const sortedHours = [...args.hours].sort((a, b) => a - b);
  const startHour = sortedHours[0];
  const endHour = sortedHours[sortedHours.length - 1] + 1;

  const res = await client.events.insert({
    calendarId,
    requestBody: {
      summary: args.summary,
      description: args.description,
      start: { dateTime: isoForDayHour(args.date, startHour), timeZone: VN_TZ },
      end: { dateTime: isoForDayHour(args.date, endHour), timeZone: VN_TZ },
    },
  });

  if (!res.data.id) return null;
  return { eventId: res.data.id };
}
