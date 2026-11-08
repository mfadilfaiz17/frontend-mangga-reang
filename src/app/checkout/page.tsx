
"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./checkout.module.css";
import { createRfq } from "@/lib/api";
import { addNotification } from "@/lib/notifications";

function CheckoutContent() {
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
        title: "RFQ berhasil diajukan",
        message: `RFQ #${rfq.id} berhasil dibuat dan menunggu verifikasi admin gudang.`,
      });
      setSuccess(`RFQ #${rfq.id} berhasil dibuat dengan status ${rfq.statusNego}.`);
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
          <div className={styles.brandTitle}>
            JURAGAN MANGGA
          </div>

          <div className={styles.brandName}>
            REANG
          </div>

          <div className={styles.brandLine}></div>
        </div>

        <div className={styles.heading}>
          <h1>CHECKOUT</h1>
          <p>PRODUCT</p>
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
            <img
              src={image}
              alt={name}
              className={styles.productImage}
            />
          </div>

          <div className={styles.productInformation}>
            <h2>{name}</h2>

            <p className={styles.productPrice}>
              {formatRupiah(price)} / Ton
            </p>

            <p className={styles.supplier}>
              {supplier}
            </p>

            <p className={styles.supplier}>
              {supplierAddress}
            </p>
          </div>

          {/* QUANTITY */}
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

          <div className={styles.unit}>
            Ton
          </div>

          <div className={styles.itemTotal}>
            {formatRupiah(total)}
          </div>
        </div>

        {/* TOTAL */}
        <div className={styles.totalSection}>
          <div className={styles.totalInformation}>
            <span>ESTIMASI NILAI RFQ</span>
            <strong>{formatRupiah(total)}</strong>
          </div>

          <button
            className={styles.checkoutButton}
            onClick={handleCheckout}
            disabled={submitting}
          >
            {submitting ? "MEMPROSES..." : "AJUKAN RFQ"}
          </button>
          {error && <p role="alert">{error}</p>}
          {success && <p role="status">{success}</p>}
        </div>

      </section>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<main className={styles.checkoutPage}>Memuat checkout...</main>}>
      <CheckoutContent />
    </Suspense>
  );
}
