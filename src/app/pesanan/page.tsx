"use client";

import { useEffect, useState } from "react";
import {
  getMyRfqs,
  getTracking,
  type Rfq,
  type TrackingEvent,
} from "@/lib/api";

type TrackingByRfq = Record<number, TrackingEvent[]>;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Rfq[]>([]);
  const [tracking, setTracking] = useState<TrackingByRfq>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        if (typeof window === "undefined" || !localStorage.getItem("accessToken")) {
          setError("Silakan login untuk melihat RFQ dan tracking Anda.");
          return;
        }

        const result = await getMyRfqs();
        setOrders(result);
        const entries = await Promise.all(
          result.map(async (order) => {
            try {
              return [order.id, await getTracking(order.id)] as const;
            } catch {
              return [order.id, []] as const;
            }
          }),
        );
        setTracking(Object.fromEntries(entries));
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Pesanan tidak dapat dimuat.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadOrders();
  }, []);

  return (
    <main className="min-h-screen bg-[#fff8e9] px-4 pb-16 pt-28 sm:px-8">
      <section className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-black uppercase text-black">
          Pesanan Saya
        </h1>
        <p className="mt-2 text-stone-700">
          Status RFQ dan histori tracking dari backend.
        </p>

        {loading && <p className="mt-8">Memuat pesanan...</p>}
        {error && (
          <p className="mt-8 rounded-xl bg-red-100 p-4 text-red-800" role="alert">
            {error}
          </p>
        )}
        {!loading && !error && orders.length === 0 && (
          <p className="mt-8 rounded-xl bg-white p-6">Belum ada RFQ.</p>
        )}

        <div className="mt-8 grid gap-5">
          {orders.map((order) => (
            <article key={order.id} className="rounded-2xl bg-white p-6 shadow">
              <div className="flex flex-wrap justify-between gap-3">
                <h2 className="text-xl font-black">RFQ #{order.id}</h2>
                <span className="rounded-full bg-[#FFA800] px-3 py-1 text-sm font-bold">
                  {order.statusNego}
                </span>
              </div>
              <p className="mt-2">
                Inventaris #{order.idMangga} - {order.tonaseDiminta} ton
              </p>
              <p className="text-sm text-stone-600">
                Total: Rp {Number(order.totalHarga).toLocaleString("id-ID")}
              </p>

              <h3 className="mt-5 font-bold uppercase">Tracking</h3>
              {tracking[order.id]?.length ? (
                <ol className="mt-2 space-y-2 border-l-2 border-[#FFA800] pl-4">
                  {tracking[order.id].map((event) => (
                    <li key={event.id}>
                      <p className="font-semibold">{event.statusMilestone}</p>
                      <p className="text-sm text-stone-600">
                        {event.catatanQc ?? "Tidak ada catatan"} -{" "}
                        {new Date(event.updatedAt).toLocaleString("id-ID")}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-2 text-sm text-stone-600">
                  Belum ada pembaruan tracking dari admin.
                </p>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
