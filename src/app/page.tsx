import Hero from "@/components/Hero";
import ShopBeranda from "@/components/Shopberanda";
import Contact from "@/components/Contact";
import ScrollFx from "@/components/ScrollFx";
import { fetchProducts } from "./shop/products";

export const instant = false;

export default async function Home() {
  const products = await fetchProducts();
  return (
    <main>
      <ScrollFx />
      <Hero />
      <ShopBeranda products={products} />
      <Contact />
    </main>
  );
}