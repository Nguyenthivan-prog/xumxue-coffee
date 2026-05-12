import Image from "next/image";
import { CAFE_INFO } from "@/lib/config";

export function Footer() {
  return (
    <footer className="bg-chocolate text-cream/80">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-8 justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-cream p-2 flex items-center justify-center">
              <Image
                src="/brand-logo.png"
                alt="Xum Xuê Coffee"
                width={56}
                height={56}
              />
            </div>
            <div>
              <p className="text-cream font-semibold">{CAFE_INFO.name}</p>
              <p className="text-cream/60 text-xs">{CAFE_INFO.email}</p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <a href="#phong" className="hover:text-cream">
              Phòng họp
            </a>
            <a href="#dat-phong" className="hover:text-cream">
              Đặt phòng
            </a>
            <a href="#khong-gian" className="hover:text-cream">
              Không gian
            </a>
            <a href="/menu" className="hover:text-cream">
              Menu
            </a>
            <a href="#lien-he" className="hover:text-cream">
              Liên hệ
            </a>
          </nav>
        </div>
        <div className="mt-8 pt-6 border-t border-cream/15 text-xs text-cream/50 flex flex-col sm:flex-row gap-2 justify-between">
          <p>
            © {new Date().getFullYear()} {CAFE_INFO.name}
          </p>
          <p>{CAFE_INFO.address}</p>
        </div>
      </div>
    </footer>
  );
}
