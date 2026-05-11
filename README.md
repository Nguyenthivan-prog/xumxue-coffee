# Xum Xuê Coffee — Webapp đặt phòng họp

Landing page + widget đặt phòng họp theo giờ. Đọc lịch trống và tạo booking trực tiếp trên Google Calendar.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Google Calendar API (qua Service Account)

## Chạy local

```bash
cd web
npm install
cp .env.local.example .env.local   # rồi điền giá trị
npm run dev
```

Mở http://localhost:3000.

App vẫn chạy được khi chưa có `.env.local` — ở chế độ **mock**: mọi khung giờ đều available, mỗi lần đặt chỉ log ra console (không ghi Calendar). Hữu ích để xem giao diện trước khi setup Google Cloud.

## Setup Google Calendar (1 lần)

### Bước 1 — Google Cloud Console

1. Vào https://console.cloud.google.com với tài khoản `xumxuecoffee@gmail.com`.
2. Tạo project mới (tên gợi ý: "Xum Xue Booking").
3. Menu trái → **APIs & Services** → **Library** → search "Google Calendar API" → **Enable**.
4. **IAM & Admin** → **Service Accounts** → **Create service account**:
   - Tên: `booking-bot`
   - Bỏ qua các bước quyền phụ → **Done**.
5. Click vào service account vừa tạo → tab **Keys** → **Add Key** → **Create new key** → **JSON** → tải file về.

> Giữ file JSON cẩn thận. **Không** đẩy lên GitHub.

### Bước 2 — Google Calendar

1. Vào https://calendar.google.com bằng cùng tài khoản.
2. Sidebar trái → **Other calendars** → dấu **+** → **Create new calendar**:
   - Tạo 2 calendar: "Phòng họp lớn — Xum Xuê" và "Phòng họp nhỏ — Xum Xuê".
3. Với mỗi calendar:
   - Click vào tên calendar → **Settings and sharing**.
   - Mục **Share with specific people** → **Add people**:
     - Email: `booking-bot@xxx.iam.gserviceaccount.com` (lấy từ field `client_email` trong file JSON).
     - Permission: **Make changes to events**.
   - Kéo xuống mục **Integrate calendar** → copy giá trị **Calendar ID** (dạng `xxx@group.calendar.google.com`).

### Bước 3 — Điền `.env.local`

```bash
cp .env.local.example .env.local
```

Mở `.env.local`, điền:

- `GOOGLE_SERVICE_ACCOUNT_JSON`: nội dung file JSON đã tải (đặt trong dấu nháy đơn `'...'`, giữ nguyên nội dung).
- `CALENDAR_ID_LARGE`: Calendar ID của Phòng họp lớn.
- `CALENDAR_ID_SMALL`: Calendar ID của Phòng họp nhỏ.

Restart `npm run dev`. Đặt phòng thử — kiểm tra event xuất hiện trên Google Calendar.

## Cấu trúc

```
web/
├── app/
│   ├── api/
│   │   ├── slots/route.ts       — GET khung giờ trống
│   │   └── bookings/route.ts    — POST tạo booking
│   ├── layout.tsx
│   ├── page.tsx                 — Trang chủ
│   └── globals.css              — Theme màu thương hiệu
├── components/
│   ├── Hero.tsx
│   ├── RoomCards.tsx
│   ├── BookingWidget.tsx        — Widget 5 bước
│   ├── Gallery.tsx              — Cần ảnh trong public/gallery/
│   ├── Menu.tsx
│   ├── Location.tsx
│   └── Footer.tsx
├── lib/
│   ├── config.ts                — Phòng, giá, giờ mở
│   ├── google-calendar.ts       — Client Calendar API
│   └── types.ts
└── public/
    └── gallery/                 — Đặt ảnh space-1.jpg → space-4.jpg
```

## Tuỳ chỉnh

- **Đổi giá / mô tả phòng / giờ mở**: `lib/config.ts`.
- **Đổi địa chỉ / điện thoại / bản đồ**: `lib/config.ts` mục `CAFE_INFO`.
- **Đổi menu**: `components/Menu.tsx`.
- **Thay ảnh không gian**: copy file vào `public/gallery/` với tên `space-1.jpg` đến `space-4.jpg`.
- **Đổi màu thương hiệu**: `app/globals.css` mục `@theme`.

## Deploy

Đề xuất Vercel (free, 1-click):

1. Push code lên GitHub.
2. https://vercel.com/new → import repo.
3. Vào **Settings** → **Environment Variables**, thêm 3 biến giống `.env.local`.
4. Deploy → connect domain `xumxuecoffee.com`.

## Phase 2 (sau MVP)

- Thanh toán VietQR (vietqr.io) sinh QR theo số tiền + nội dung CK.
- Auto-confirm thanh toán qua webhook Sepay/Casso (đọc giao dịch ngân hàng).
- Email xác nhận tự động (Resend).
- Admin dashboard xem booking + huỷ.
