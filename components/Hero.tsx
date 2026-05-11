import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream">
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(107,124,60,0.18), transparent 45%), radial-gradient(circle at 80% 70%, rgba(156,106,59,0.18), transparent 45%)",
        }}
      />
      <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center text-center">
        <Image
          src="/brand-logo.png"
          alt="Xum Xuê Coffee"
          width={180}
          height={180}
          priority
          className="mb-6 drop-shadow-sm"
        />
        <h1 className="text-chocolate font-semibold text-4xl md:text-6xl leading-tight max-w-3xl">
          Đặt phòng họp theo giờ
          <br />
          <span className="text-caramel">tại Xum Xuê Coffee</span>
        </h1>
        <p className="mt-6 max-w-xl text-walnut text-base md:text-lg">
          02 phòng họp cho thuê theo giờ. Chọn ngày, xem khung giờ trống
          và đặt phòng trực tiếp trên Google Calendar của quán.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link
            href="#dat-phong"
            className="px-7 py-3.5 rounded-full bg-chocolate text-cream font-medium hover:bg-walnut transition-colors"
          >
            Đặt phòng ngay
          </Link>
          <Link
            href="#phong"
            className="px-7 py-3.5 rounded-full border border-walnut/40 text-chocolate hover:bg-cream/60 transition-colors"
          >
            Xem 2 phòng
          </Link>
        </div>
        <p className="mt-10 text-walnut/70 text-sm">
          Mở cửa hằng ngày · 8:00 – 24:00
        </p>
      </div>
    </section>
  );
}
