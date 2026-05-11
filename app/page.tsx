import { Hero } from "@/components/Hero";
import { RoomCards } from "@/components/RoomCards";
import { BookingWidget } from "@/components/BookingWidget";
import { Gallery } from "@/components/Gallery";
import { Menu } from "@/components/Menu";
import { Location } from "@/components/Location";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <RoomCards />
      <BookingWidget />
      <Gallery />
      <Menu />
      <Location />
      <Footer />
    </main>
  );
}
