const GALLERY_ITEMS = [
  { src: "/gallery/space-1.jpg", alt: "Không gian quán" },
  { src: "/gallery/space-2.jpg", alt: "Không gian quán" },
  { src: "/gallery/space-6.jpg", alt: "Không gian quán" },
  { src: "/gallery/space-7.jpg", alt: "Không gian quán" },
  { src: "/gallery/space-8.jpg", alt: "Không gian quán" },
  { src: "/gallery/space-9.jpg", alt: "Không gian quán" },
  { src: "/gallery/space-10.jpg", alt: "Không gian quán" },
];

export function Gallery() {
  return (
    <section id="khong-gian" className="bg-offwhite">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <header className="text-center mb-12">
          <p className="text-caramel tracking-[0.3em] text-xs uppercase mb-3">
            Không gian
          </p>
          <h2 className="text-chocolate text-3xl md:text-4xl font-semibold">
            Hình ảnh quán
          </h2>
        </header>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 md:gap-4">
          {GALLERY_ITEMS.map((item) => (
            <figure
              key={item.src}
              className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-sand border border-ochre/30"
              style={{
                backgroundImage: `url(${item.src})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <figcaption className="absolute inset-0 flex items-end p-4 text-cream text-sm bg-gradient-to-t from-chocolate/70 via-chocolate/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                {item.alt}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
