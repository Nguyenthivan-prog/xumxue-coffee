import { CAFE_INFO } from "@/lib/config";

export function Location() {
  return (
    <section id="lien-he" className="bg-offwhite">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <header className="text-center mb-12">
          <p className="text-caramel tracking-[0.3em] text-xs uppercase mb-3">
            Tìm đến quán
          </p>
          <h2 className="text-chocolate text-3xl md:text-4xl font-semibold">
            Địa chỉ quán
          </h2>
        </header>
        <div className="grid md:grid-cols-5 gap-8 items-stretch">
          <div className="md:col-span-2 flex flex-col gap-6">
            <InfoBlock label="Địa chỉ" value={CAFE_INFO.address} />
            <InfoBlock label="Giờ mở cửa" value="8:00 – 24:00 hằng ngày" />
            <InfoBlock label="Điện thoại" value={CAFE_INFO.phone} />
            {CAFE_INFO.email && (
              <InfoBlock label="Email" value={CAFE_INFO.email} />
            )}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                CAFE_INFO.name + " " + CAFE_INFO.address
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex items-center justify-center px-6 py-3 rounded-full bg-chocolate text-cream font-medium hover:bg-walnut transition-colors"
            >
              Mở Google Maps
            </a>
          </div>
          <div className="md:col-span-3 rounded-2xl overflow-hidden border border-ochre/30 bg-sand/30 min-h-[320px]">
            <iframe
              src={CAFE_INFO.mapEmbedUrl}
              title="Bản đồ Xum Xuê Coffee"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: 320 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-walnut/70 text-xs uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-chocolate">{value}</p>
    </div>
  );
}
