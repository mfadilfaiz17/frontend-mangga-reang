
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import styles from "./notification.module.css";

import {
  getNotifications,
  markAllNotificationsRead,
  type NotificationItem,
} from "@/lib/notifications";

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<
    NotificationItem[]
  >(() => getNotifications());

  useEffect(() => {
    const refresh = () => setNotifications(getNotifications());
    window.addEventListener("notifications:changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("notifications:changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const allRead =
    notifications.length > 0 &&
    notifications.every((item) => item.read);

  const handleMarkAllRead = () => {
    const updatedNotifications = markAllNotificationsRead();
    setNotifications(updatedNotifications);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <main className={styles.notificationPage}>
      {/* HEADER HALAMAN */}

      <section className={styles.heading}>
        <div className={styles.brand}>
          <span className={styles.brandTop}>
            JURAGAN MANGGA
          </span>

          <span className={styles.brandBottom}>
            REANG
          </span>
        </div>

        <div className={styles.headingDivider} />

        <div className={styles.headingTitle}>
          <span className={styles.headingSubtitle}>
            PUSAT INFORMASI
          </span>

          <h1>NOTIFICATION</h1>

          <p>
            Semua informasi terbaru tentang aktivitas akunmu.
          </p>
        </div>

        <div className={styles.mangoDecoration}>
          <Image
            src="/images/manggaGedongGincu.png"
            alt="Mangga Gedong Gincu"
            fill
            priority
            sizes="(max-width: 600px) 100px, 190px"
            className={styles.mangoImage}
          />
        </div>
      </section>

      {/* CONTAINER NOTIFIKASI */}

      <section className={styles.notificationContainer}>
        <div className={styles.containerHeader}>
          <div>
            <span className={styles.sectionLabel}>
              YOUR ACTIVITY
            </span>

            <h2>Notifikasi Terbaru</h2>

            <p>
              Pantau seluruh informasi dan aktivitas terbaru.
            </p>
          </div>

          {notifications.length > 0 && (
            <div className={styles.notificationCount}>
              <span>{notifications.length}</span>
              NOTIFIKASI
            </div>
          )}
        </div>

        <div className={styles.contentDivider} />

        {/* TANDAI SEMUA SUDAH DIBACA */}

        {notifications.length > 0 && (
          <div className={styles.toolbar}>
            <label className={styles.markAll}>
              <input
                type="checkbox"
                checked={allRead}
                onChange={handleMarkAllRead}
                disabled={allRead}
              />

              <span className={styles.customCheckbox} />

              <span>
                TANDAI SEMUA SUDAH DIBACA
              </span>
            </label>
          </div>
        )}

        {/* EMPTY STATE */}

        {notifications.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg
                viewBox="0 0 24 24"
                width="72"
                height="72"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" />
                <path d="M10 21h4" />
              </svg>
            </div>

            <h2>BELUM ADA NOTIFIKASI</h2>

            <p>
              Belum ada informasi terbaru untuk saat ini.
            </p>

            <span>
              Notifikasi terbaru akan muncul secara otomatis
              di halaman ini.
            </span>
          </div>
        ) : (
          /* DAFTAR NOTIFIKASI */

          <div className={styles.notificationList}>
            {notifications.map((item) => (
              <article
                key={item.id}
                className={`${styles.notificationCard} ${
                  item.read ? styles.read : styles.unread
                }`}
              >
                <div className={styles.cardIcon}>
                  <svg
                    viewBox="0 0 24 24"
                    width="25"
                    height="25"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" />
                    <path d="M10 21h4" />
                  </svg>
                </div>

                <div className={styles.notificationContent}>
                  <div className={styles.notificationTitle}>
                    <h3>{item.title}</h3>

                    {!item.read && (
                      <span className={styles.newBadge}>
                        BARU
                      </span>
                    )}
                  </div>

                  <p>{item.message}</p>

                  <span className={styles.notificationDate}>
                    {formatDate(item.createdAt)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
