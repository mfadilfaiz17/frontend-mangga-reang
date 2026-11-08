"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  getCurrentUser,
  clearSession,
  changePassword,
  updateCurrentUser,
  type UserResponse,
} from "@/lib/api";

function PasswordEyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {hidden ? (
        <>
          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
          <path d="M6.61 6.61A13.53 13.53 0 0 1 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
          <line x1="2" y1="2" x2="22" y2="22" />
        </>
      ) : (
        <>
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      getCurrentUser()
        .then((currentUser) => {
          setUser(currentUser);
          setName(currentUser.namaLengkap);
          setCompany(currentUser.namaPerusahaan ?? "");
        })
        .catch(() => {
          clearSession();
          router.replace("/");
        })
        .finally(() => setLoading(false));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const updated = await updateCurrentUser({
        namaLengkap: name.trim(),
        namaPerusahaan: company.trim() || null,
      });
      setUser(updated);
      setMessage("Profil berhasil diperbarui.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Profil gagal diperbarui.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setMessage("Password berhasil diperbarui.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Password gagal diperbarui.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fff7e8] p-8 pt-32">
        <p className="font-black uppercase tracking-widest text-[#9a5a00]">
          Memuat profil...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fff7e8] p-6 pt-32">
        <section className="w-full max-w-lg rounded-[2rem] border-2 border-[#ffbd24] bg-white p-8 text-center shadow-[0_14px_35px_rgba(154,90,0,0.18)]">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#ffbd24] text-2xl font-black text-[#5a3300]">
            ?
          </div>
          <h1 className="mt-5 text-3xl font-black uppercase">Profil</h1>
          <p className="mt-3 text-stone-700">{error}</p>
          <Link href="/" className="mt-6 inline-block rounded-full bg-[#ff9d00] px-6 py-3 font-black uppercase text-black shadow-md transition hover:-translate-y-0.5">
            Kembali
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff7e8] px-4 pb-20 pt-32 sm:px-8 sm:pt-36">
      <section className="mx-auto max-w-3xl overflow-hidden rounded-[2rem] border-2 border-[#ffbd24] bg-white shadow-[0_16px_40px_rgba(154,90,0,0.18)]">
        <header className="bg-gradient-to-r from-[#ffbd24] via-[#ffae00] to-[#ff9d00] px-6 py-8 sm:px-10">
          <div className="flex flex-wrap items-center gap-5">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full border-4 border-white/80 bg-[#fff7e8] text-3xl font-black text-[#9a5a00] shadow-md">
              {user.namaLengkap.trim().charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#5a3300]">
                Akun Juragan Mangga Reang
              </p>
              <h1 className="mt-1 text-3xl font-black uppercase text-black sm:text-4xl">
                Profil Saya
              </h1>
              <span className="mt-3 inline-block rounded-full bg-black px-3 py-1 text-xs font-black uppercase tracking-wider text-white">
                {user.role}
              </span>
            </div>
          </div>
        </header>

        <div className="p-6 sm:p-10">
          <p className="text-stone-600">
            Perbarui informasi kontak akun. Email dan role dikelola oleh sistem
            dan tidak dapat diubah dari halaman ini.
          </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm font-black uppercase tracking-wide">Nama lengkap</span>
            <input required value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-xl border-2 border-[#ffbd24] bg-[#fffdf8] p-3 outline-none transition focus:border-[#ff9d00] focus:ring-4 focus:ring-[#ffbd24]/30" />
          </label>
          <label className="block">
            <span className="text-sm font-black uppercase tracking-wide">Email</span>
            <input value={user.email} readOnly className="mt-2 w-full cursor-not-allowed rounded-xl border-2 border-stone-200 bg-stone-100 p-3 text-stone-600" />
          </label>
          <label className="block">
            <span className="text-sm font-black uppercase tracking-wide">Nama perusahaan</span>
            <input value={company} onChange={(event) => setCompany(event.target.value)} className="mt-2 w-full rounded-xl border-2 border-[#ffbd24] bg-[#fffdf8] p-3 outline-none transition focus:border-[#ff9d00] focus:ring-4 focus:ring-[#ffbd24]/30" />
          </label>
          <label className="block">
            <span className="text-sm font-black uppercase tracking-wide">Role</span>
            <input value={user.role} readOnly className="mt-2 w-full cursor-not-allowed rounded-xl border-2 border-stone-200 bg-stone-100 p-3 text-stone-600" />
          </label>
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{error}</p>}
          {message && <p className="rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-700" role="status">{message}</p>}
          <div className="flex flex-wrap items-center gap-3">
            <button disabled={saving} className="rounded-full bg-[#1EEB1E] px-6 py-3 font-black uppercase text-black shadow-md transition hover:-translate-y-0.5 disabled:opacity-50">
              {saving ? "Menyimpan..." : "Simpan profil"}
            </button>
            <Link href="/" className="rounded-full border-2 border-black px-6 py-3 font-black uppercase transition hover:bg-black hover:text-white">
              Kembali
            </Link>
          </div>
        </form>
        <form onSubmit={handlePasswordChange} className="mt-10 border-t-2 border-[#ffbd24] pt-8">
          <h2 className="text-xl font-black uppercase">Keamanan akun</h2>
          <p className="mt-2 text-sm text-stone-600">Gunakan password baru minimal 8 karakter.</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="relative block">
              <span className="text-sm font-black uppercase tracking-wide">Password saat ini</span>
              <div className="relative mt-2">
                <input required type={showCurrentPassword ? "text" : "password"} value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="w-full rounded-xl border-2 border-[#ffbd24] bg-[#fffdf8] p-3 pr-12 outline-none focus:border-[#ff9d00] focus:ring-4 focus:ring-[#ffbd24]/30" autoComplete="current-password" />
                <button type="button" onClick={() => setShowCurrentPassword((value) => !value)} aria-label={showCurrentPassword ? "Sembunyikan password saat ini" : "Tampilkan password saat ini"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-[#7a4b00] hover:bg-[#ffedbd]">
                  <PasswordEyeIcon hidden={!showCurrentPassword} />
                </button>
              </div>
            </label>
            <label className="relative block">
              <span className="text-sm font-black uppercase tracking-wide">Password baru</span>
              <div className="relative mt-2">
                <input required minLength={8} type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="w-full rounded-xl border-2 border-[#ffbd24] bg-[#fffdf8] p-3 pr-12 outline-none focus:border-[#ff9d00] focus:ring-4 focus:ring-[#ffbd24]/30" autoComplete="new-password" />
                <button type="button" onClick={() => setShowNewPassword((value) => !value)} aria-label={showNewPassword ? "Sembunyikan password baru" : "Tampilkan password baru"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-[#7a4b00] hover:bg-[#ffedbd]">
                  <PasswordEyeIcon hidden={!showNewPassword} />
                </button>
              </div>
            </label>
          </div>
          <button disabled={saving} className="mt-5 rounded-full bg-black px-6 py-3 font-black uppercase text-white disabled:opacity-50">
            Ubah password
          </button>
        </form>
        </div>
      </section>
    </main>
  );
}