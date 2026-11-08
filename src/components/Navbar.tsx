"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import styles from "./Navbar.module.css";

import { LoginTrigger } from "./loginModal";
import { SignupTrigger } from "./signupModal";
import { clearSession, getCurrentUser, type UserResponse } from "@/lib/api";

/* =========================================
   SVG PROPERTIES
========================================= */

const svgProps = {
  viewBox: "0 0 24 24",
  width: "1em",
  height: "1em",
  "aria-hidden": true,
  focusable: false,
} as const;

/* =========================================
   NAVIGATION ICONS
========================================= */

const BellIcon = (
  <svg {...svgProps} fill="#ff9c00">
    <path d="M12 2a6 6 0 0 0-6 6v4l-2 3v1h16v-1l-2-3V8a6 6 0 0 0-6-6Zm0 20a2.5 2.5 0 0 0 2.4-2H9.6A2.5 2.5 0 0 0 12 22Z" />
  </svg>
);

const HelpIcon = (
  <svg {...svgProps}>
    <circle cx="12" cy="12" r="10" fill="#111" />
    <path
      d="M9.4 9.6a2.6 2.6 0 1 1 3.7 2.3c-.8.4-1.1.9-1.1 1.8"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    <circle cx="12" cy="17.2" r="1.3" fill="#fff" />
  </svg>
);

const ShopIcon = (
  <svg {...svgProps} fill="#ff9c00">
    <path d="M3 9.5 5 4h14l2 5.5V11a3 3 0 0 1-5.3 1.9A3 3 0 0 1 12 14a3 3 0 0 1-3.7-1.1A3 3 0 0 1 3 11V9.5ZM5 15h14v5H5v-5Z" />
  </svg>
);

const PencilIcon = (
  <svg {...svgProps} fill="#111">
    <path d="m4 20 1.2-5L16 4.2 19.8 8 9 18.8 4 20Z" />
  </svg>
);

const CartIcon = (
  <svg {...svgProps} fill="#6b3b00">
    <path d="M4 9h16l-1.8 10H5.8L4 9Zm4.2-5.2L10 6H7.4L6 4.8l2.2-1Zm7.6 0 2.2 1L16.6 6H14l1.8-2.2Z" />
  </svg>
);

/* =========================================
   NAVIGATION DATA
========================================= */

const navigation: {
  href: string;
  label: string;
  icon: ReactNode;
}[] = [
  {
    href: "/notifikasi",
    label: "Notifikasi",
    icon: BellIcon,
  },
  {
    href: "/#alur",
    label: "Alur",
    icon: HelpIcon,
  },
  {
    href: "/shop",
    label: "Shop",
    icon: ShopIcon,
  },
  {
    href: "/pesanan",
    label: "Pesanan",
    icon: CartIcon,
  },
  {
    href: "/#contact",
    label: "Contact",
    icon: PencilIcon,
  },
];

/* =========================================
   NAVBAR COMPONENT
========================================= */

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      const token = window.localStorage.getItem("accessToken");
      if (!token) {
        if (active) setUser(null);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        if (active) setUser(currentUser);
      } catch {
        clearSession();
      }
    };

    void loadUser();
    window.addEventListener("auth:changed", loadUser);
    return () => {
      active = false;
      window.removeEventListener("auth:changed", loadUser);
    };
  }, []);

  function handleLogout() {
    clearSession();
    router.replace("/");
  }

  return (
    <header className={styles.header}>

      {/* NAVIGATION PLATE */}

      <svg
        className={styles.navPlate}
        viewBox="0 0 700 46"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M0 0C60 1 72 8 76 20L83 37Q87 46 100 46H600Q613 46 617 37L624 20C628 8 640 1 700 0Z"
          fill="#fffdf8"
        />
      </svg>

      {/* PRIMARY NAVIGATION */}

      <nav
        className={styles.primaryNav}
        aria-label="Navigasi utama"
      >
        {navigation.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={styles.navLink}
          >
            <span className={styles.navIcon}>
              {item.icon}
            </span>

            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* ACCOUNT AREA */}

      <div className={styles.accountArea}>
        {/* LOGIN & SIGN UP */}

        {user ? (
          <div className={styles.accountLinks}>
            <span className={styles.loginLink}>
              {user.namaLengkap} ({user.role})
            </span>
            <Link className={styles.signupLink} href="/profil">
              PROFIL
            </Link>
            {user.role !== "BUYER_B2B" && (
              <Link className={styles.signupLink} href="/dashboard">
                DASHBOARD
              </Link>
            )}
            <button
              type="button"
              className={styles.signupLink}
              onClick={handleLogout}
            >
              LOGOUT
            </button>
          </div>
        ) : (
          <div className={styles.accountLinks}>
            <LoginTrigger className={styles.loginLink}>LOGIN</LoginTrigger>
            <span className={styles.divider} aria-hidden="true">|</span>
            <SignupTrigger className={styles.signupLink}>SIGN UP</SignupTrigger>
          </div>
        )}

        {/* SHOPPING CART */}

        <Link
          href="/keranjang"
          className={styles.cartLink}
        >
          <span className={styles.cartIcon}>
            {CartIcon}
          </span>

          <span>KERANJANG</span>
        </Link>

      </div>
    </header>
  );
}