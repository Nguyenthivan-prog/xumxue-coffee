import type { RoomId } from "./config";

export interface Slot {
  hour: number;
  available: boolean;
}

export interface BookingRequest {
  roomId: RoomId;
  date: string;
  hours: number[];
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  note?: string;
}

export interface BookingResponse {
  ok: boolean;
  eventId?: string;
  message?: string;
}

export interface SlotsResponse {
  date: string;
  roomId: RoomId;
  slots: Slot[];
}
