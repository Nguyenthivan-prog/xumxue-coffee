import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["vietnamese", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Xum Xuê Coffee — Đặt phòng họp",
  description:
    "Cho thuê phòng họp theo giờ tại Xum Xuê Coffee. Phòng lớn 30–40 người, phòng nhỏ 6–8 người. Xem khung giờ trống và đặt phòng trực tiếp qua Google Calendar.",
  metadataBase: new URL("https://xumxuecoffee.com"),
  icons: {
    icon: "/brand-logo.png",
    apple: "/brand-logo.png",
  },
  openGraph: {
    title: "Xum Xuê Coffee — Đặt phòng họp",
    description:
      "Cho thuê phòng họp theo giờ tại Xum Xuê Coffee. Phòng lớn 30–40 người, phòng nhỏ 6–8 người.",
    locale: "vi_VN",
    type: "website",
    images: ["/brand-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${beVietnam.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
