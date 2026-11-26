import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Eye,
  EyeOff,
  LoaderCircle,
  X,
  Mail,
  LockKeyhole,
  UserRound,
  ArrowRight,
} from "lucide-react";

import UrumayaLogo from "./UrumayaLogo";
import "../styles/AuthLayout.css";

// ==========================================
// BOTANICAL DECORATION
// ==========================================

function Botanical({ className = "" }) {
  return (
    <svg
      viewBox="0 0 200 310"
      className={`au-botanical ${className}`}
      aria-hidden="true"
    >
      <g fill="currentColor">
        <path
          d="M15 302C32 210 76 103 168 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path d="M29 252C2 234 -4 196 8 174C32 198 43 222 29 252Z" />
        <path d="M30 251C69 221 103 231 133 251C92 270 58 268 30 251Z" />
        <path d="M48 201C14 175 15 139 25 114C51 139 64 171 48 201Z" />
        <path d="M50 198C86 165 126 174 159 194C118 217 83 217 50 198Z" />
        <path d="M75 149C43 122 47 84 62 61C88 89 91 119 75 149Z" />
        <path d="M77 147C113 115 150 120 183 137C145 161 109 165 77 147Z" />
        <path d="M108 97C88 64 97 33 119 13C134 46 129 76 108 97Z" />
        <path d="M111 94C143 65 173 68 197 78C172 103 141 112 111 94Z" />
        <path d="M150 30C139 12 153 2 174 0C176 15 166 25 150 30Z" />
      </g>
    </svg>
  );
}

// ==========================================
// LOTUS DIVIDER
// ==========================================

function Lotus() {
  return (
    <svg
      viewBox="0 0 80 60"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M40 49C25 37 27 18 40 5C53 18 55 37 40 49Z" />
      <path d="M40 49C20 48 10 32 12 17C29 18 40 31 40 49Z" />
      <path d="M40 49C60 48 70 32 68 17C51 18 40 31 40 49Z" />
      <path d="M40 49C22 58 8 47 3 32C21 28 33 37 40 49Z" />
      <path d="M40 49C58 58 72 47 77 32C59 28 47 37 40 49Z" />
      <path d="M40 49V57" />
    </svg>
  );
}

function LotusDivider() {
  return (
    <div className="au-lotus-divider">
      <span />
      <Lotus />
      <span />
    </div>
  );
}

// ==========================================
// SHARED AUTHENTICATION LAYOUT
// ==========================================

export default function AuthLayout({
  title,
  subtitle,
  children,
  compact = false,
}) {
  const navigate = useNavigate();
  const dialogRef = useRef(null);

  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    const previousScrollBehavior =
      document.documentElement.style.scrollBehavior;

    document.documentElement.style.scrollBehavior =
      "auto";

    window.scrollTo(0, 0);

    document.body.style.overflow = "hidden";

    dialogRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        navigate("/", { replace: true });
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements =
        dialogRef.current?.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]'
        );

      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0];

      const lastElement =
        focusableElements[focusableElements.length - 1];

      if (
        event.shiftKey &&
        (
          document.activeElement === firstElement ||
          document.activeElement === dialogRef.current
        )
      ) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === lastElement
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      document.documentElement.style.scrollBehavior =
        previousScrollBehavior;

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [navigate]);

  return (
    <div className="au-overlay">
      <div className="au-wrapper">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-title"
          tabIndex={-1}
          className={`au-dialog ${
            compact ? "au-compact" : ""
          }`}
        >
          {/* Close button */}

          <Link
            to="/"
            replace
            aria-label="Close authentication"
            className="au-close"
          >
            <X size={21} />
          </Link>

          {/* Heritage panel */}

          <aside className="au-brand-panel">
            <Botanical className="au-brand-leaf-top" />
            <Botanical className="au-brand-leaf-bottom" />

            <div className="au-brand-border" />

            <div className="au-brand-content">
              <div className="au-brand-lotus">
                <Lotus />
              </div>

              <p className="au-eyebrow">
                THE SPIRIT OF SRI LANKA
              </p>

              <h2>
                Heritage.
                <br />
                Craftsmanship.
                <br />
                Timeless Beauty.
              </h2>

              <div className="au-brand-line" />

              <p className="au-brand-description">
                Discover meaningful creations inspired
                by generations of tradition, culture
                and artistry.
              </p>

              <p className="au-brand-tagline">
                Rooted in Heritage
              </p>
            </div>

            <span className="au-brand-footer">
              URUMAYA — SRI LANKA
            </span>
          </aside>

          {/* Authentication form */}

          <section className="au-form-panel">
            <Botanical className="au-form-leaf" />

            <div className="au-form-content">
              <div className="au-logo">
                <UrumayaLogo light />
              </div>

              <div className="au-heading">
                <p className="au-eyebrow">
                  YOUR URUMAYA JOURNEY
                </p>

                <h1 id="auth-title">{title}</h1>

                <LotusDivider />

                <p className="au-subtitle">
                  {subtitle}
                </p>
              </div>

              {children}

{/* Live Demo Access */}
<div className="mt-3 border-t border-[#D9CBB5] pt-3 text-center">

  <p className="text-[11px] text-[#81796D]">
    Want to explore without an account?
  </p>

  <Link
    to="/demo"
    className="mt-1.5 inline-flex items-center justify-center gap-2 text-xs font-semibold text-[#103D46] transition-colors hover:text-[#B95035]"
  >
    Explore Live Demo
    <ArrowRight size={14} />
  </Link>

</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// REUSABLE INPUT FIELD
// ==========================================

export function AuthInput({
  label,
  id,
  type = "text",
  compact = false,
  ...props
}) {
  const [visible, setVisible] = useState(false);

  const isPassword = type === "password";

  const FieldIcon = isPassword
    ? LockKeyhole
    : type === "email"
      ? Mail
      : UserRound;

  return (
    <div className={`au-field ${compact ? "au-field-compact" : ""}`}>
      <label htmlFor={id}>
        {label}
      </label>

      <div className="au-input-wrapper">
        <FieldIcon
          size={17}
          className="au-input-icon"
          aria-hidden="true"
        />

        <input
          {...props}
          id={id}
          type={
            isPassword
              ? visible
                ? "text"
                : "password"
              : type
          }
          className={`au-input ${
            isPassword ? "au-password-input" : ""
          }`}
        />

        {isPassword && (
          <button
            type="button"
            disabled={props.disabled}
            onClick={() =>
              setVisible((previous) => !previous)
            }
            aria-label={
              visible
                ? "Hide password"
                : "Show password"
            }
            aria-pressed={visible}
            className="au-password-toggle"
          >
            {visible ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ==========================================
// REUSABLE SUBMIT BUTTON
// ==========================================

export function AuthButton({
  submitting,
  children,
  loadingText,
  compact = false,
}) {
  return (
    <button
      type="submit"
      disabled={submitting}
      className={`au-submit ${
        compact ? "au-submit-compact" : ""
      }`}
    >
      {submitting ? (
        <>
          <LoaderCircle
            size={18}
            className="animate-spin"
          />

          {loadingText}
        </>
      ) : (
        <>
          {children}
          <ArrowRight size={17} />
        </>
      )}
    </button>
  );
}