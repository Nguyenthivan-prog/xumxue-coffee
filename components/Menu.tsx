import Link from "next/link";
import { MENU, type MenuItem } from "@/lib/menu-data";

function TempBadge({ temp }: { temp: "cold" | "hot" }) {
  const isCold = temp === "cold";
  return (
    <span
      title={isCold ? "Có đá" : "Nóng"}
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
    <li className="flex items-center justify-between gap-3 py-2 border-b border-ochre/15 last:border-0">
      <div className="min-w-0">
        <p className="text-chocolate">{item.name}</p>
        {item.note && (
          <p className="text-walnut/60 text-xs italic">({item.note})</p>
        )}
      </div>
      {item.temps.length > 0 && (
        <div className="flex gap-1.5 shrink-0">
          {item.temps.map((t) => (
            <TempBadge key={t} temp={t} />
          ))}
        </div>
      )}
    </li>
  );
}

export function Menu() {
  return (
    <section id="menu" className="bg-cream">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <header className="text-center mb-12">
          <p className="text-caramel tracking-[0.3em] text-xs uppercase mb-3">
            Menu
          </p>
          <h2 className="text-chocolate text-3xl md:text-4xl font-semibold">
            Đồ uống tại quán
          </h2>
          <div className="mt-4 inline-flex items-center gap-4 text-xs text-walnut/70">
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MENU.map((group) => (
            <div
              key={group.title}
              className="bg-offwhite border border-ochre/25 rounded-2xl p-6"
            >
              <h3 className="text-chocolate text-lg font-semibold mb-3 pb-2 border-b border-ochre/30 flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-leaf" />
                {group.title}
              </h3>
              <ul>
                {group.items.map((item) => (
                  <MenuRow key={item.name} item={item} />
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-walnut/30 text-chocolate hover:bg-sand/40 transition-colors"
          >
            Xem menu fullscreen (in / chụp ảnh)
            <span>→</span>
          </Link>
          <p className="text-walnut/60 text-xs mt-3">
            Giá đồ uống sẽ được cập nhật sau
          </p>
        </div>
      </div>
    </section>
  );
}
