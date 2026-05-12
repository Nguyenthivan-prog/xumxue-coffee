import { ROOM_LIST, formatVND } from "@/lib/config";

export function BookingWidget() {
  return (
    <section id="dat-phong" className="bg-walnut/95 text-cream">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <header className="text-center mb-10">
          <p className="text-sand tracking-[0.3em] text-xs uppercase mb-3">
            Đặt phòng
          </p>
          <h2 className="text-cream text-3xl md:text-4xl font-semibold">
            Chọn phòng bạn muốn đặt
          </h2>
          <p className="mt-4 text-cream/70 max-w-xl mx-auto">
            Đặt phòng qua Google Calendar của quán. Chọn ngày, khung giờ trống,
            điền thông tin liên hệ. Quán sẽ liên hệ xác nhận qua số điện thoại
            bạn cung cấp.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-5">
          {ROOM_LIST.map((room) => (
            <a
              key={room.id}
              href={room.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-2xl bg-cream text-chocolate p-7 hover:bg-offwhite transition-colors"
            >
              <div className="flex items-baseline justify-between gap-4 mb-2">
                <h3 className="text-2xl font-semibold">{room.name}</h3>
                <span className="shrink-0 text-walnut/70 text-sm">
                  {room.capacity}
                </span>
              </div>
              <p className="text-walnut/90 leading-relaxed mb-6">
                {room.description}
              </p>
              <div className="mt-auto flex items-end justify-between gap-4 pt-4 border-t border-ochre/30">
                <div>
                  <p className="text-walnut/70 text-xs uppercase tracking-wider">
                    Giá thuê
                  </p>
                  <p className="text-chocolate text-2xl font-semibold mt-1">
                    {formatVND(room.pricePerHour)}
                    <span className="text-walnut/70 text-base font-normal">
                      /giờ
                    </span>
                  </p>
                </div>
                <span className="px-5 py-2.5 rounded-full bg-caramel text-cream text-sm font-medium group-hover:bg-walnut transition-colors">
                  Đặt phòng này →
                </span>
              </div>
            </a>
          ))}
        </div>

        <p className="mt-8 text-center text-cream/60 text-sm">
          Quán mở cửa hằng ngày 8:00 – 24:00. Đặt theo khung 1 giờ.
        </p>
      </div>
    </section>
  );
}
