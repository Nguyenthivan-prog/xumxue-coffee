import Image from "next/image";
import type { Metadata } from "next";
import { MENU, type MenuItem } from "@/lib/menu-data";
import { CAFE_INFO } from "@/lib/config";

export const metadata: Metadata = {
  title: "Menu — Xum Xuê Coffee",
  description: "Menu đồ uống Xum Xuê Coffee",
};

function TempBadge({ temp }: { temp: "cold" | "hot" }) {
  const isCold = temp === "cold";
  return (
    <span
      className={`shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-semibold ${
        isCold
          ? "bg-sand/70 text-walnut border border-ochre/40"
          : "bg-caramel/15 text-caramel border border-caramel/40"
      }`}
    >
      {isCold ? "Đá" : "N"}
    </span>
  );
}

function MenuRow({ item }: { item: MenuItem }) {
  return (
    <li className="flex items-center justify-between gap-3 py-1.5 border-b border-ochre/15 last:border-0">
      <div className="min-w-0">
        <p className="text-chocolate text-[15px]">{item.name}</p>
        {item.note && (
          <p className="text-walnut/60 text-[11px] italic">({item.note})</p>
        )}
      </div>
      {item.temps.length > 0 && (
        <div className="flex gap-1 shrink-0">
          {item.temps.map((t) => (
            <TempBadge key={t} temp={t} />
          ))}
        </div>
      )}
    </li>
  );
}

export default function MenuPage() {
  return (
    <main className="min-h-screen bg-cream py-10 px-6 print:py-0">
      <div className="max-w-4xl mx-auto bg-offwhite rounded-3xl shadow-xl print:shadow-none print:rounded-none p-10 md:p-14 border border-ochre/30">
        <header className="text-center mb-10">
          <Image
            src="/brand-logo.png"
            alt="Xum Xuê Coffee"
            width={140}
            height={140}
            className="mx-auto mb-2"
            priority
          />
          <p className="text-caramel tracking-[0.4em] text-xs uppercase">
            Menu
          </p>
          <h1 className="text-chocolate text-2xl font-semibold mt-1">
            Đồ uống tại quán
          </h1>
          <div className="mt-3 inline-flex items-center gap-4 text-xs text-walnut/70">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-flex w-5 h-5 rounded-full bg-sand/70 border border-ochre/40 items-center justify-center text-[9px] font-semibold text-walnut">
                Đá
              </span>
              Có đá
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-flex w-5 h-5 rounded-full bg-caramel/15 border border-caramel/40 items-center justify-center text-[9px] font-semibold text-caramel">
                N
              </span>
              Nóng
            </span>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-x-10 gap-y-6">
          {MENU.map((group) => (
            <section key={group.title} className="break-inside-avoid">
              <h2 className="text-chocolate text-base font-semibold mb-2 pb-1.5 border-b-2 border-leaf/60 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-leaf" />
                {group.title}
              </h2>
              <ul>
                {group.items.map((item) => (
                  <MenuRow key={item.name} item={item} />
                ))}
              </ul>
            </section>
          ))}
        </div>

        <footer className="mt-10 pt-6 border-t border-ochre/30 text-center">
          <p className="text-walnut/80 text-sm">{CAFE_INFO.address}</p>
          <p className="text-walnut/60 text-xs mt-1">
            {CAFE_INFO.email} · Mở cửa 8:00 – 24:00 hằng ngày
          </p>
        </footer>
      </div>
      <p className="text-center text-walnut/50 text-xs mt-4 print:hidden">
        Nhấn Cmd/Ctrl + P để in ra PDF · Cmd+Shift+4 (Mac) hoặc Win+Shift+S (Windows) để chụp ảnh
      </p>
    </main>
  );
}
