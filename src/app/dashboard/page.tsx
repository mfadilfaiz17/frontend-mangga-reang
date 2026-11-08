"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { LoginTrigger } from "@/components/loginModal";
import {
  approveRfq,
  completeRfq,
  createInventory,
  getAllRfqs,
  getCurrentUser,
  getMyInventory,
  rejectRfq,
  updateTracking,
  type Grade,
  type Inventory,
  type LogisticsMilestone,
  type Rfq,
  type UserResponse,
  type Variety,
} from "@/lib/api";

const varieties: Variety[] = ["GEDONG_GINCU", "CENGKIR", "HARUMANIS"];
const grades: Grade[] = ["GRADE_A", "GRADE_B", "GRADE_C"];
const milestones: LogisticsMilestone[] = [
  "DIPROSES_PETANI",
  "SORTIR_GUDANG",
  "IN_TRANSIT",
  "DELIVERED",
];

export default function DashboardPage() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      setError("");
      try {
        setUser(await getCurrentUser());
      } catch (requestError) {
        setUser(null);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Sesi tidak valid.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadUser();
    window.addEventListener("auth:changed", loadUser);
    return () => window.removeEventListener("auth:changed", loadUser);
  }, []);

  if (loading) return <main className="p-8 pt-32">Memuat dashboard...</main>;
  if (error || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fff8e9] p-6 pt-32">
        <section className="max-w-lg rounded-2xl bg-white p-8 text-center shadow">
          <h1 className="text-3xl font-black uppercase">Dashboard</h1>
          <p className="mt-3 text-stone-700">
            Login dengan akun petani atau admin gudang untuk membuka dashboard
            operasional.
          </p>
          {error && (
            <p className="mt-4 text-sm text-red-700" role="alert">
              Session belum aktif.
            </p>
          )}
          <div className="mt-6 flex justify-center gap-3">
            <LoginTrigger className="rounded-full bg-[#FFA800] px-5 py-3 font-bold">
              Login
            </LoginTrigger>
            <Link
              href="/"
              className="rounded-full border border-black px-5 py-3 font-bold"
            >
              Kembali
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (user.role === "ADMIN_GUDANG") return <AdminDashboard />;
  if (user.role === "PETANI") return <FarmerDashboard />;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fff8e9] p-6 pt-32">
      <section className="max-w-lg rounded-2xl bg-white p-8 text-center shadow">
        <h1 className="text-3xl font-black uppercase">Area Buyer B2B</h1>
        <p className="mt-3 text-stone-700">
          Dashboard operasional hanya tersedia untuk petani dan admin gudang.
          Gunakan katalog dan halaman pesanan untuk alur buyer.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/shop" className="rounded-full bg-[#1EEB1E] px-5 py-3 font-bold">
            Buka katalog
          </Link>
          <Link href="/pesanan" className="rounded-full border border-black px-5 py-3 font-bold">
            Pesanan saya
          </Link>
        </div>
      </section>
    </main>
  );
}

function AdminDashboard() {
  const [orders, setOrders] = useState<Rfq[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedRfq, setSelectedRfq] = useState<number | null>(null);
  const [milestone, setMilestone] = useState<LogisticsMilestone>("SORTIR_GUDANG");
  const [note, setNote] = useState("");

  const loadOrders = async () => {
    try {
      setOrders(await getAllRfqs());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "RFQ gagal dimuat.");
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void loadOrders(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await approveRfq(id);
      setMessage(`RFQ #${id} berhasil disetujui.`);
      await loadOrders();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Approval gagal.");
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectRfq(id);
      setMessage(`RFQ #${id} ditolak.`);
      await loadOrders();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Penolakan gagal.");
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await completeRfq(id);
      setMessage(`RFQ #${id} ditandai selesai.`);
      await loadOrders();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Penyelesaian gagal.");
    }
  };

  const handleTracking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedRfq) return;
    try {
      await updateTracking(selectedRfq, milestone, note);
      setMessage(`Tracking RFQ #${selectedRfq} berhasil diperbarui.`);
      setNote("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Tracking gagal diperbarui.");
    }
  };

  return (
    <main className="min-h-screen bg-[#fff8e9] p-6 pt-32 sm:p-10 sm:pt-36">
      <section className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-black uppercase">Dashboard Gudang</h1>
        <p className="mt-2 text-stone-700">Kelola approval RFQ dan milestone logistik.</p>
        {error && <p className="mt-4 rounded-lg bg-red-100 p-3 text-red-800" role="alert">{error}</p>}
        {message && <p className="mt-4 rounded-lg bg-green-100 p-3 text-green-800" role="status">{message}</p>}
        <div className="mt-8 grid gap-4">
          {orders.map((order) => (
            <article key={order.id} className="rounded-2xl bg-white p-5 shadow">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-black">RFQ #{order.id}</h2>
                  <p>{order.tonaseDiminta} ton · Inventaris #{order.idMangga}</p>
                </div>
                <span className="rounded-full bg-[#FFA800] px-3 py-1 text-sm font-bold">{order.statusNego}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {order.statusNego === "PENDING" && (
                  <>
                    <button className="rounded-full bg-[#1EEB1E] px-4 py-2 font-bold" onClick={() => handleApprove(order.id)}>
                      Setujui RFQ
                    </button>
                    <button className="rounded-full border border-red-700 px-4 py-2 font-bold text-red-700" onClick={() => handleReject(order.id)}>
                      Tolak RFQ
                    </button>
                  </>
                )}
                {order.statusNego === "APPROVED" && (
                  <>
                    <button className="rounded-full bg-black px-4 py-2 font-bold text-white" onClick={() => setSelectedRfq(order.id)}>
                      Update tracking
                    </button>
                    <button className="rounded-full bg-[#1EEB1E] px-4 py-2 font-bold" onClick={() => handleComplete(order.id)}>
                      Tandai selesai
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
        {selectedRfq && (
          <form onSubmit={handleTracking} className="mt-8 rounded-2xl bg-white p-5 shadow">
            <h2 className="font-black">Tracking RFQ #{selectedRfq}</h2>
            <select className="mt-4 w-full rounded-lg border p-3" value={milestone} onChange={(event) => setMilestone(event.target.value as LogisticsMilestone)}>
              {milestones.map((item) => <option key={item}>{item}</option>)}
            </select>
            <textarea className="mt-3 w-full rounded-lg border p-3" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Catatan QC (opsional)" />
            <button className="mt-3 rounded-full bg-[#FFA800] px-4 py-2 font-bold">Simpan tracking</button>
          </form>
        )}
      </section>
    </main>
  );
}

function FarmerDashboard() {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ varietas: "HARUMANIS" as Variety, grade: "GRADE_A" as Grade, tonaseTersedia: "", hargaPerTon: "", lokasiKebun: "" });

  useEffect(() => {
    getMyInventory()
      .then((items) => setInventory(items))
      .catch((requestError) =>
        setError(requestError instanceof Error ? requestError.message : "Inventaris gagal dimuat."),
      );
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await createInventory({ ...form, tonaseTersedia: Number(form.tonaseTersedia), hargaPerTon: Number(form.hargaPerTon) });
      setMessage("Inventaris berhasil ditambahkan.");
      setForm({ ...form, tonaseTersedia: "", hargaPerTon: "", lokasiKebun: "" });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Inventaris gagal disimpan.");
    }
  };

  return (
    <main className="min-h-screen bg-[#fff8e9] p-6 pt-32 sm:p-10 sm:pt-36">
      <section className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-black uppercase">Dashboard Petani</h1>
        <p className="mt-2 text-stone-700">Kelola stok dan harga mangga Anda.</p>
        {error && <p className="mt-4 rounded-lg bg-red-100 p-3 text-red-800" role="alert">{error}</p>}
        {message && <p className="mt-4 rounded-lg bg-green-100 p-3 text-green-800" role="status">{message}</p>}
        <form onSubmit={submit} className="mt-8 grid gap-3 rounded-2xl bg-white p-5 shadow sm:grid-cols-2">
          <select className="rounded-lg border p-3" value={form.varietas} onChange={(event) => setForm({ ...form, varietas: event.target.value as Variety })}>{varieties.map((item) => <option key={item}>{item}</option>)}</select>
          <select className="rounded-lg border p-3" value={form.grade} onChange={(event) => setForm({ ...form, grade: event.target.value as Grade })}>{grades.map((item) => <option key={item}>{item}</option>)}</select>
          <input required min="0.001" step="0.001" type="number" placeholder="Tonase tersedia (ton)" className="rounded-lg border p-3" value={form.tonaseTersedia} onChange={(event) => setForm({ ...form, tonaseTersedia: event.target.value })} />
          <input required min="0" step="0.01" type="number" placeholder="Harga per ton" className="rounded-lg border p-3" value={form.hargaPerTon} onChange={(event) => setForm({ ...form, hargaPerTon: event.target.value })} />
          <input required placeholder="Lokasi kebun" className="rounded-lg border p-3 sm:col-span-2" value={form.lokasiKebun} onChange={(event) => setForm({ ...form, lokasiKebun: event.target.value })} />
          <button className="rounded-full bg-[#1EEB1E] px-4 py-3 font-black sm:col-span-2">Tambah inventaris</button>
        </form>
        <div className="mt-8 grid gap-3">{inventory.map((item) => <div key={item.id} className="rounded-xl bg-white p-4 shadow">{item.varietas} · {item.grade} · {item.tonaseTersedia} ton · Rp {Number(item.hargaPerTon).toLocaleString("id-ID")}</div>)}</div>
      </section>
    </main>
  );
}
