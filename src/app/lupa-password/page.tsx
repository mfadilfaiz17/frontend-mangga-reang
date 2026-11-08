"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { requestPasswordReset } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      const response = await requestPasswordReset(email.trim());
      setMessage(response.detail);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Permintaan reset password gagal.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fff7e6] px-4 py-12">
      <section className="w-full max-w-lg rounded-[2rem] bg-white p-8 shadow-xl sm:p-12">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#e08a00]">
          Juragan Mangga Reang
        </p>
        <h1 className="mt-4 text-3xl font-black text-[#3d2500]">
          Lupa password?
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#765b38]">
          Masukkan email akun Anda. Jika terdaftar, kami akan mengirim link
          reset password yang berlaku terbatas.
        </p>
        <form onSubmit={submit} className="mt-8 space-y-5">
          <label className="block text-sm font-bold text-[#3d2500]">
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-[#f0c36d] bg-[#fffaf0] px-4 outline-none focus:ring-4 focus:ring-orange-200"
              autoComplete="email"
            />
          </label>
          {message && <p className="rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-800">{message}</p>}
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p>}
          <button
            disabled={submitting}
            className="h-12 w-full rounded-xl bg-[#f5a400] font-black uppercase tracking-[0.15em] text-white transition hover:bg-[#df8e00] disabled:opacity-60"
          >
            {submitting ? "Mengirim..." : "Kirim link reset"}
          </button>
        </form>
        <Link href="/" className="mt-6 block text-center text-sm font-bold text-[#8a4b00] underline">
          Kembali ke beranda
        </Link>
      </section>
    </main>
  );
}
