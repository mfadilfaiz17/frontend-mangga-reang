import Hero from "@/components/Hero";
import ShopBeranda from "@/components/Shopberanda";
import Contact from "@/components/Contact";
import ScrollFx from "@/components/ScrollFx";

const products = [
  {
    name: "Mangga Harum Manis",
    price: 20000,
    supplier: "Supplier Mangga A",
    address: "Indramayu, Jawa Barat",
    image: "/images/manggaHarumManis.png",
  },
  {
    name: "Mangga Manalagi",
    price: 22000,
    supplier: "Supplier Mangga B",
    address: "Majalengka, Jawa Barat",
    image: "/images/manggaManalagi.png",
  },
  {
    name: "Mangga Gedong Gincu",
    price: 52000,
    supplier: "Supplier Mangga C",
    address: "Cirebon, Jawa Barat",
    image: "/images/manggaGedongGincu.png",
  },
  {
    name: "Mangga Madu",
    price: 25000,
    supplier: "Supplier Mangga D",
    address: "Indramayu, Jawa Barat",
    image: "/images/manggaMadu.png",
  },
];

export default function Home() {
  return (
    <main>
      <ScrollFx />
      <Hero />
      <ShopBeranda products={products} />
      <Contact />
    </main>
  );
}