import { getInventory, type Inventory } from "@/lib/api";

export type Product = {
  id: number;
  slug: string;
  name: string;
  price: number;
  supplier: string;
  address: string;
  image: string;
  grade: string;
  stockTons: number;
};

const imageForVariety: Record<string, string> = {
  GEDONG_GINCU: "/images/manggaGedongGincu.png",
  CENGKIR: "/images/manggaMadu.png",
  HARUMANIS: "/images/manggaHarumManis.png",
};

export function inventoryToProduct(item: Inventory): Product {
  const name = item.varietas.replaceAll("_", " ");
  return {
    id: item.id,
    slug: `inventory-${item.id}`,
    name: `Mangga ${name}`,
    price: Number(item.hargaPerTon),
    supplier: `Petani #${item.idPetani}`, // Nanti bisa dijoin dengan tabel user
    address: item.lokasiKebun,
    image: imageForVariety[item.varietas] ?? "/images/manggaHarumManis.png",
    grade: item.grade,
    stockTons: Number(item.tonaseTersedia),
  };
}

// Fungsi utama penarik data dari Backend
export async function fetchProducts(): Promise<Product[]> {
  const inventory = await getInventory();
  return inventory.map(inventoryToProduct);
}

// Sesuaikan menjadi /Ton untuk target B2B
export const formatRupiah = (n: number) =>
  "Rp." + n.toLocaleString("id-ID") + "/Ton";