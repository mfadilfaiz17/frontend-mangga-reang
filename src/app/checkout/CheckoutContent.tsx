"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./checkout.module.css";
// Pastikan path import ini sesuai dengan lokasi file API dan notifikasimu
import { createRfq } from "@/lib/api"; 
import { addNotification } from "@/lib/notifications";

export default function CheckoutContent() {
  const params = useSearchParams();
  const inventoryId = Number(params.get("inventoryId"));

  // DATA PRODUK DARI HALAMAN DETAIL
  const name = params.get("name") || "Produk Mangga";
  const price = Number(params.get("price")) || 0;
  const supplier = params.get("supplier") || "-";
  const supplierAddress = params.get("address") || "-";
  const image = params.get("image") || "/images/manggaHarumManis.png";

  const [quantity, setQuantity] = useState(
    Number(params.get("quantity")) || 1
  );

  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [editingAddress, setEditingAddress] = useState(false);
  const [payment, setPayment] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const total = quantity * price;

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  const handleCheckout = async () => {
    if (!customerName.trim()) {
      alert("Masukkan nama pembeli/perusahaan!");
      return;
    }

    if (!address.trim()) {
      alert("Masukkan alamat pengiriman!");
      return;
    }

    if (!payment) {
      alert("Pilih metode pembayaran (ToP)!");
      return;
    }

    if (!inventoryId) {
      setError("Produk belum memiliki ID inventaris dari backend.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");
    
    try {
      const rfq = await createRfq(inventoryId, quantity);
      
      addNotification({
        title: "RFQ Berhasil Diajukan",
        message: `RFQ #${rfq.id} berhasil dibuat dan menunggu verifikasi admin gudang.`,
      });
      
      setSuccess(`Pesanan B2B (RFQ #${rfq.id}) berhasil diajukan dengan status ${rfq.statusNego}.`);
      
      // Opsional: Redirect ke halaman dashboard/sukses setelah beberapa detik
      // setTimeout(() => router.push('/dashboard'), 3000);
      
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Checkout gagal. Silakan coba lagi.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.checkoutPage}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.brandTitle}>JURAGAN MANGGA</div>
          <div className={styles.brandName}>REANG</div>
          <div className={styles.brandLine}></div>
        </div>

        <div className={styles.heading}>
          <h1>CHECKOUT B2B</h1>
          <p>PROCUREMENT</p>
        </div>

        <img
          src="/images/manggaLandingP.png"
          alt="Mangga Juragan Mangga Reang"
          className={styles.headerMango}
        />
      </header>

      {/* CHECKOUT CONTAINER */}
      <section className={styles.checkoutContainer}>
        <div className={styles.tableHeader}>
          <span>JUMLAH</span>
          <span>SATUAN</span>
          <span>HARGA</span>
        </div>

        {/* PRODUCT CARD */}
        <div className={styles.productCard}>
          <div className={styles.productImageWrapper}>
            <img src={image} alt={name} className={styles.productImage} />
          </div>

          <div className={styles.productInformation}>
            <h2>{name}</h2>
            <p className={styles.productPrice}>{formatRupiah(price)} / Ton</p>
            <p className={styles.supplier}>{supplier}</p>
            <p className={styles.supplier}>{supplierAddress}</p>
          </div>

          {/* QUANTITY CONTROL (Skala Tonase) */}
          <div className={styles.quantityControl}>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className={styles.quantityButton}
            >
              +
            </button>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, Number(e.target.value) || 1))
              }
              className={styles.quantityInput}
            />
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className={styles.quantityButton}
            >
              -
            </button>
          </div>

          <div className={styles.unit}>Ton</div>

          <div className={styles.itemTotal}>{formatRupiah(total)}</div>
        </div>

        {/* ADDRESS SECTION */}
        <section className={styles.addressSection}>
          <h3>ALAMAT PENGIRIMAN B2B</h3>

          <div className={styles.addressRow}>
            <label>NAMA PERUSAHAAN/BUYER</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className={styles.customerInput}
              placeholder="MASUKKAN NAMA PERUSAHAAN"
            />
          </div>

          <div className={styles.addressRow}>
            <label>ALAMAT GUDANG TUJUAN</label>
            {editingAddress ? (
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={styles.addressInput}
                placeholder="MASUKKAN ALAMAT LENGKAP"
                autoFocus
              />
            ) : (
              <div className={styles.addressDisplay}>
                {address || "ALAMAT KONSUMEN"}
              </div>
            )}
            <button
              className={styles.editAddressButton}
              onClick={() => setEditingAddress(!editingAddress)}
            >
              {editingAddress ? "SIMPAN" : "UBAH ALAMAT"}
            </button>
          </div>
        </section>

        {/* PAYMENT SECTION */}
        <section className={styles.paymentSection}>
          <h3>TERM OF PAYMENT (ToP)</h3>
          <div className={styles.paymentOptions}>
            {["TRANSFER BANK", "ESCROW B2B", "TEMPO 30 HARI", "TEMPO 14 HARI"].map((method) => (
              <button
                key={method}
                onClick={() => setPayment(method)}
                className={`${styles.paymentButton} ${
                  payment === method ? styles.paymentActive : ""
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </section>

        {/* TOTAL & SUBMIT */}
        <div className={styles.totalSection}>
          <div className={styles.totalInformation}>
            <span>ESTIMASI NILAI RFQ</span>
            <strong>{formatRupiah(total)}</strong>
            
            {/* Area Notifikasi Error/Success */}
            {error && <span style={{ color: "#d90000", fontSize: "14px" }}>{error}</span>}
            {success && <span style={{ color: "#005500", fontSize: "14px" }}>{success}</span>}
          </div>

          <button
            className={styles.checkoutButton}
            onClick={handleCheckout}
            disabled={submitting}
          >
            {submitting ? "MEMPROSES..." : "AJUKAN RFQ"}
          </button>
        </div>
      </section>
    </main>
  );
}