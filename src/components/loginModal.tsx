"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";

import {
  Cormorant_Garamond,
  Montserrat,
} from "next/font/google";

import styles from "./Animation.module.css";
import { loginUser } from "@/lib/api";

/* =========================================
   FONT
========================================= */

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
});

const sans = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800", "900"],
});

/* =========================================
   IMAGE
========================================= */

const MANGO_SRC = "/images/manggaLandingP.png";

/* =========================================
   ICONS
========================================= */

const svgBase = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

function UserCheckIcon() {
  return (
    <svg {...svgBase} className="h-7 w-7">
      <circle
        cx="10"
        cy="7.5"
        r="4"
        fill="currentColor"
      />

      <path
        d="M2.5 21v-1.5a6 6 0 0 1 6-6H11"
        fill="currentColor"
      />

      <circle
        cx="18"
        cy="17.5"
        r="5"
        fill="currentColor"
        stroke="#FFB300"
      />

      <path
        d="M15.6 17.7l1.7 1.7 3-3.3"
        stroke="#fff"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg {...svgBase} className="h-7 w-7">
      <rect
        x="4.5"
        y="11"
        width="15"
        height="10"
        rx="2.5"
        fill="currentColor"
      />

      <path d="M8 11V7.5a4 4 0 0 1 7.6-1.7" />
    </svg>
  );
}

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg {...svgBase} className="h-6 w-6">
      {off ? (
        <>
          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />

          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />

          <path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />

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

function CloseIcon() {
  return (
    <svg
      {...svgBase}
      strokeWidth={2.5}
      className="h-5 w-5"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81z"
      />

      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3a7.2 7.2 0 0 1-10.73-3.78H1.3v3.09A12 12 0 0 0 12 24z"
      />

      <path
        fill="#FBBC05"
        d="M5.33 14.3a7.2 7.2 0 0 1 0-4.6V6.61H1.3a12 12 0 0 0 0 10.78l4.03-3.09z"
      />

      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.61 4.58 1.8l3.43-3.43A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.3 6.61l4.03 3.09A7.15 7.15 0 0 1 12 4.75z"
      />
    </svg>
  );
}

function WhatsappIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="12"
        fill="#25D366"
      />

      <path
        d="M12 4.5a7.5 7.5 0 1 1-3.4 14.2L4.5 19.5l.9-3.9A7.5 7.5 0 0 1 12 4.5z"
        fill="none"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      <path
        d="M9.3 8.6c.2-.2.6-.2.8.1l.7 1.4c.1.2 0 .4-.1.6l-.4.5c.6 1.2 1.5 2 2.6 2.6l.5-.5c.2-.2.4-.2.6-.1l1.4.7c.3.2.3.5.1.8-.5.9-1.5 1.2-2.4.9-2.4-.8-4.1-2.5-4.8-4.8-.2-.8 0-1.5.5-2.1z"
        fill="#fff"
      />
    </svg>
  );
}

/* =========================================
   SHARED STYLES
========================================= */

const fieldSurface = `
  bg-[linear-gradient(to_bottom,#FFD04D,#FFAE00)]
  shadow-[0_6px_12px_rgba(120,60,0,0.22),inset_0_2px_3px_rgba(255,255,255,0.65)]
`;

const inputClass = `
  ${fieldSurface}
  h-12 w-full rounded-full
  px-6 pr-16
  text-sm font-semibold
  tracking-[0.15em]
  text-[#5a3300]
  outline-none
  transition-all duration-300
  placeholder:font-medium
  placeholder:uppercase
  placeholder:tracking-[0.4em]
  placeholder:text-[#9a6200]
  focus-visible:ring-4
  focus-visible:ring-white/70
  sm:h-14 sm:px-8 sm:text-base
`;

const socialBtn = `
  ${fieldSurface}
  flex h-12 items-center gap-2
  rounded-xl px-2
  transition-all duration-300
  hover:brightness-105
  focus-visible:outline-none
  focus-visible:ring-4
  focus-visible:ring-white/70
  sm:h-14 sm:px-3
`;

const socialText = `
  flex-1 text-center
  text-[9px] font-semibold
  uppercase leading-snug
  tracking-[0.3em]
  text-[#9a5a00]
  sm:text-[11px]
`;

/* =========================================
   SSR SUPPORT
========================================= */

const subscribe = () => () => {};

const getClientSnapshot = () => true;

const getServerSnapshot = () => false;

/* =========================================
   TYPES
========================================= */

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
};

/* =========================================
   LOGIN MODAL
========================================= */

export default function LoginModal({
  open,
  onClose,
}: LoginModalProps) {
  const [mounted, setMounted] = useState(false);

  const [shown, setShown] = useState(false);

  const isClient = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);

  const usernameRef = useRef<HTMLInputElement>(null);

  const lastFocus = useRef<HTMLElement | null>(null);

  /* =========================================
     MODAL VISIBILITY
  ========================================= */

  if (open && !mounted) {
    setMounted(true);
  }

  const visible = open && shown;

  useEffect(() => {
    if (open) {
      lastFocus.current =
        document.activeElement as HTMLElement | null;

      const id = requestAnimationFrame(() =>
        requestAnimationFrame(() => setShown(true))
      );

      return () => cancelAnimationFrame(id);
    }

    const timer = setTimeout(() => {
      setShown(false);
      setMounted(false);
      setShowPassword(false);
      setError("");

      lastFocus.current?.focus();
    }, 700);

    return () => clearTimeout(timer);
  }, [open]);

  /* =========================================
     PREVENT BACKGROUND SCROLL
  ========================================= */

  useEffect(() => {
    if (!mounted) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mounted]);

  /* =========================================
     AUTO FOCUS
  ========================================= */

  useEffect(() => {
    if (visible) {
      usernameRef.current?.focus({
        preventScroll: true,
      });
    }
  }, [visible]);

  /* =========================================
     KEYBOARD NAVIGATION
  ========================================= */

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLDivElement>
  ) {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }

    if (e.key !== "Tab") return;

    const items =
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), a[href]'
      );

    if (!items || items.length === 0) return;

    const first = items[0];

    const last = items[items.length - 1];

    if (
      e.shiftKey &&
      document.activeElement === first
    ) {
      e.preventDefault();
      last.focus();
    } else if (
      !e.shiftKey &&
      document.activeElement === last
    ) {
      e.preventDefault();
      first.focus();
    }
  }

  /* =========================================
     CLOSE MODAL
  ========================================= */

  function handleBackdropMouseDown(
    e: React.MouseEvent<HTMLDivElement>
  ) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  /* =========================================
     LOGIN VALIDATION
  ========================================= */

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const data = new FormData(e.currentTarget);

    const email = String(
      data.get("email") ?? ""
    ).trim();

    const password = String(
      data.get("password") ?? ""
    );

    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await loginUser(email, password);
      onClose();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Login gagal. Coba lagi.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* =========================================
     PORTAL
  ========================================= */

  if (!mounted || !isClient) {
    return null;
  }

  return createPortal(
    <div
      className={`
        ${sans.className}
        fixed inset-0 z-[100]
        overflow-y-auto
        bg-[rgba(255,190,70,0.20)]
        transition-all duration-700 ease-out
        ${
          visible
            ? "opacity-100 backdrop-blur-[12px]"
            : "opacity-0 backdrop-blur-none"
        }
      `}
      onKeyDown={handleKeyDown}
      onMouseDown={handleBackdropMouseDown}
    >
      {/* =====================================
          MODAL WRAPPER
      ===================================== */}

      <div
        className="
          flex min-h-full
          items-center justify-center
          px-4 py-16
        "
        onMouseDown={handleBackdropMouseDown}
      >
        {/* =====================================
            LOGIN CARD
        ===================================== */}

        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-title"
          className={`
            ${styles.loginCard}
            relative isolate
            w-full max-w-[550px]
            rounded-[2.5rem]
            px-[8%] pb-[7%] pt-[7%]
            [container-type:inline-size]
            ${
              visible
                ? styles.cardVisible
                : styles.cardHidden
            }
          `}
          style={{
            background: `
              linear-gradient(
                to bottom,
                rgba(255,255,255,0.98) 0%,
                rgba(255,255,255,0.95) 15%,
                rgba(255,246,220,0.88) 35%,
                rgba(255,201,60,0.72) 65%,
                rgba(255,165,0,0.35) 100%
              )
            `,

            backdropFilter: "blur(22px)",

            WebkitBackdropFilter: "blur(22px)",

            border: "1px solid rgba(255,255,255,0.45)",
          }}
        >

          {/* =====================================
              BOTTOM GLASS DECORATION
              HANYA BACKGROUND, TANPA BLUR
          ===================================== */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute inset-x-0 bottom-0
              z-0
              h-[40%]
              rounded-b-[2.5rem]
              bg-gradient-to-b
              from-transparent
              via-orange-300/5
              to-orange-400/15
            "
          />

          {/* =====================================
              CLOSE BUTTON
          ===================================== */}

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup login"
            className="
              absolute -right-2 -top-2 z-30
              flex h-10 w-10
              items-center justify-center
              rounded-full
              bg-white text-black
              shadow-[0_6px_14px_rgba(0,0,0,0.25)]
              transition-all duration-300
              hover:rotate-90 hover:scale-110
              focus-visible:outline-none
              focus-visible:ring-4
              focus-visible:ring-orange-400/70
              sm:-right-4 sm:-top-4
            "
          >
            <CloseIcon />
          </button>

          {/* =====================================
              MANGO IMAGE
          ===================================== */}

          <div
            className={`
              ${styles.mangoMain}
              pointer-events-none
              absolute -left-3 -top-14 z-20
              w-32
              sm:-left-8 sm:-top-16 sm:w-44
              lg:-left-[10%] lg:-top-[1%] lg:w-[48%]
            `}
          >
            <Image
              src={MANGO_SRC}
              alt="Mangga utuh dan potongan mangga"
              width={386}
              height={386}
              priority
              className="
                h-auto w-full
                drop-shadow-[0_18px_22px_rgba(0,0,0,0.3)]
              "
            />
          </div>

          {/* =====================================
              LOGIN TITLE
          ===================================== */}

          <div className="relative z-10 flex justify-end">
            <div className="w-[62%] min-w-[11rem]">

              <h2
                id="login-title"
                aria-label="Login"
                className="
                  flex justify-between
                  border-b-[3px] border-black
                  pb-[1.5cqw]
                  text-[12cqw]
                  font-black uppercase
                  leading-none text-black
                "
                style={{
                  textShadow:
                    "0 6px 12px rgba(0,0,0,0.25)",
                }}
              >
                {"LOGIN".split("").map((char, index) => (
                  <span
                    key={index}
                    aria-hidden="true"
                  >
                    {char}
                  </span>
                ))}
              </h2>

              <p
                className={`
                  ${serif.className}
                  whitespace-nowrap
                  pt-[1cqw]
                  text-center
                  text-[6.4cqw]
                  font-semibold uppercase
                  leading-tight
                  tracking-[0.02em]
                  text-black
                `}
              >
                Juragan Mangga
              </p>

              <p
                aria-label="Reang"
                className="
                  flex justify-between
                  text-[11.5cqw]
                  font-extrabold uppercase
                  leading-none
                  text-[#FFA500]
                "
              >
                {"REANG".split("").map((char, index) => (
                  <span
                    key={index}
                    aria-hidden="true"
                  >
                    {char}
                  </span>
                ))}
              </p>

            </div>
          </div>

          {/* =====================================
              LOGIN FORM
              Z-INDEX 10 AGAR TETAP TAJAM
          ===================================== */}

          <form
            onSubmit={handleSubmit}
            noValidate
            className="
              relative z-10
              mt-[12cqw]
              flex flex-col
              gap-[5cqw]
            "
          >

            {/* USERNAME */}

            <div className="relative">
              <label
                htmlFor="login-email"
                className="sr-only"
              >
                Email
              </label>

              <input
                ref={usernameRef}
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Email"
                className={`${inputClass} pr-16`}
              />

              <span
                className="
                  pointer-events-none
                  absolute right-5 top-1/2
                  -translate-y-1/2
                  text-black
                "
              >
                <UserCheckIcon />
              </span>
            </div>

            {/* PASSWORD */}

            <div className="relative">
              <label
                htmlFor="login-password"
                className="sr-only"
              >
                Password
              </label>

              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Password"
                className={`${inputClass} pr-28`}
              />

              {/* SHOW PASSWORD */}

              <button
                type="button"
                onClick={() =>
                  setShowPassword((value) => !value)
                }
                aria-label={
                  showPassword
                    ? "Sembunyikan password"
                    : "Tampilkan password"
                }
                aria-pressed={showPassword}
                className="
                  absolute right-14 top-1/2
                  -translate-y-1/2
                  rounded-full p-1
                  text-black
                  transition-all duration-300
                  hover:scale-110
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-black/60
                "
              >
                <EyeIcon off={!showPassword} />
              </button>

              <span
                className="
                  pointer-events-none
                  absolute right-5 top-1/2
                  -translate-y-1/2
                  text-black
                "
              >
                <LockIcon />
              </span>
            </div>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={submitting}
              className="
                relative z-10
                mx-auto
                h-12 w-[86%]
                rounded-full
                bg-white
                text-base font-semibold
                uppercase tracking-[0.6em]
                text-[#E08A00]
                shadow-[0_8px_16px_rgba(120,60,0,0.25),inset_0_-2px_4px_rgba(255,165,0,0.25)]
                transition-all duration-300
                hover:scale-[1.02]
                hover:bg-[#FFFBF0]
                focus-visible:outline-none
                focus-visible:ring-4
                focus-visible:ring-white/80
                sm:h-14 sm:text-lg
              "
            >
              {submitting ? "Memproses..." : "Login"}
            </button>

            <Link
              href="/lupa-password"
              onClick={onClose}
              className="
                relative z-10 mx-auto -mt-[2cqw]
                text-center text-xs font-bold uppercase
                tracking-[0.18em] text-[#8a4b00] underline
                underline-offset-4 transition hover:text-black
              "
            >
              Lupa password?
            </Link>

            {/* ERROR MESSAGE */}

            {error && (
              <p
                role="alert"
                className="
                  relative z-10
                  -mt-2
                  text-center
                  text-xs font-semibold
                  tracking-wide
                  text-[#7a2e00]
                "
              >
                {error}
              </p>
            )}

            {/* =================================
                SOCIAL LOGIN
            ================================= */}

            <div className="relative z-10 grid grid-cols-2 gap-[5cqw]">

              {/* GOOGLE */}

              <button
                type="button"
                className={socialBtn}
              >
                <GoogleIcon />

                <span className={socialText}>
                  Login with
                  <br />
                  Google
                </span>
              </button>

              {/* WHATSAPP */}

              <button
                type="button"
                className={socialBtn}
              >
                <WhatsappIcon />

                <span className={socialText}>
                  Login with
                  <br />
                  WhatsApp
                </span>
              </button>

            </div>

          </form>

        </div>
      </div>
    </div>,

    document.body
  );
}

/* =========================================
   LOGIN TRIGGER
   DIPAKAI DI NAVBAR
========================================= */

export function LoginTrigger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const openLogin = () => setOpen(true);
    window.addEventListener("auth:open-login", openLogin);
    return () => window.removeEventListener("auth:open-login", openLogin);
  }, []);

  return (
    <>
      <button
        type="button"
        className={className}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        {children}
      </button>

      <LoginModal
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}