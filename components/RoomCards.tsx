import { ROOM_LIST, formatVND, type Room } from "@/lib/config";

function RoomCard({ room }: { room: Room }) {
  return (
    <article className="group flex flex-col rounded-2xl bg-offwhite border border-ochre/30 p-7 hover:border-caramel transition-colors">
      <div className="flex items-baseline justify-between gap-4 mb-3">
        <h3 className="text-chocolate text-2xl font-semibold">{room.name}</h3>
        <span className="shrink-0 text-walnut/70 text-sm">{room.capacity}</span>
      </div>
      <p className="text-walnut/90 leading-relaxed mb-5">{room.description}</p>
      <div className="flex flex-wrap gap-2 mb-6">
        {room.bestFor.map((tag) => (
          <span
            key={tag}
            className="text-xs px-3 py-1 rounded-full bg-sand/60 text-walnut"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-auto flex items-end justify-between gap-4 pt-4 border-t border-ochre/30">
        <div>
          <p className="text-walnut/70 text-xs uppercase tracking-wider">
            Giá thuê
          </p>
          <p className="text-chocolate text-2xl font-semibold mt-1">
            {formatVND(room.pricePerHour)}
            <span className="text-walnut/70 text-base font-normal">/giờ</span>
          </p>
        </div>
        <a
          href="#dat-phong"
          className="px-5 py-2.5 rounded-full bg-caramel text-cream text-sm font-medium hover:bg-walnut transition-colors"
        >
          Đặt phòng
        </a>
      </div>
    </article>
  );
}

export function RoomCards() {
  return (
    <section id="phong" className="bg-cream">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <header className="text-center mb-12">
          <p className="text-caramel tracking-[0.3em] text-xs uppercase mb-3">
            Phòng họp
          </p>
          <h2 className="text-chocolate text-3xl md:text-4xl font-semibold">
            02 không gian phòng họp để bạn lựa chọn
          </h2>
        </header>
        <div className="grid md:grid-cols-2 gap-6">
          {ROOM_LIST.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      </div>
    </section>
  );
}
