export type RoomId = "large" | "small";

export interface Room {
  id: RoomId;
  name: string;
  shortName: string;
  capacity: string;
  description: string;
  pricePerHour: number;
  bestFor: string[];
}

export const ROOMS: Record<RoomId, Room> = {
  large: {
    id: "large",
    name: "Phòng họp lớn",
    shortName: "Phòng lớn",
    capacity: "30–40 người",
    description:
      "Sức chứa 30–40 người. Phù hợp cho lớp học, workshop, hội thảo.",
    pricePerHour: 200_000,
    bestFor: ["Lớp học", "Workshop", "Hội thảo"],
  },
  small: {
    id: "small",
    name: "Phòng họp nhỏ",
    shortName: "Phòng nhỏ",
    capacity: "6–8 người",
    description:
      "Sức chứa 6–8 người. Phù hợp cho nhóm nhỏ ngồi học, làm việc nhóm, họp nội bộ.",
    pricePerHour: 50_000,
    bestFor: ["Nhóm học", "Làm việc nhóm", "Họp nhỏ"],
  },
};

export const ROOM_LIST: Room[] = [ROOMS.large, ROOMS.small];

export const OPENING_HOUR = 8;
export const CLOSING_HOUR = 24;

// URL Apps Script Web App nhận POST từ form đặt phòng.
// Project: Xum Xuê - Email xác nhận booking trên script.google.com (account Xanhla2701@gmail.com).
export const BOOKING_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbzNc4VMLITEqxn3HAaAMEB7iNScTMr4TgkFOtb5__ufY1bIfTSjTk-lv65TRTJwwA4dlQ/exec";

export const CAFE_INFO = {
  name: "Xum Xuê Coffee",
  tagline: "Cà phê & cho thuê phòng họp theo giờ tại Hà Nội",
  domain: "xumxuecoffee.com",
  email: "xumxuecoffee2@gmail.com",
  address: "Tầng 2, số 12 ngõ 4C Đặng Văn Ngữ, Trung Tự, Đống Đa, Hà Nội",
  phone: "0966 967 016",
  mapEmbedUrl:
    "https://www.google.com/maps?q=12+ng%C3%B5+4C+%C4%90%E1%BA%B7ng+V%C4%83n+Ng%E1%BB%AF,+Trung+T%E1%BB%B1,+%C4%90%E1%BB%91ng+%C4%90a,+H%C3%A0+N%E1%BB%99i&output=embed&z=17",
};

export function formatVND(value: number): string {
  return value.toLocaleString("vi-VN") + "đ";
}

export function formatHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}
