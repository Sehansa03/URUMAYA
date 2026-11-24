import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  Eye,
  EyeOff,
  LoaderCircle,
  X,
} from "lucide-react";

import UrumayaLogo from "./UrumayaLogo";

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

  // ==========================================
  // POPUP BEHAVIOUR
  // ==========================================

  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    const previousScrollBehavior =
      document.documentElement.style.scrollBehavior;

    document.documentElement.style.scrollBehavior =
      "auto";

    window.scrollTo(0, 0);

    // Prevent background scrolling
    document.body.style.overflow = "hidden";

    // Move keyboard focus into the popup
    dialogRef.current?.focus();

    // Keyboard accessibility
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
        focusableElements[
          focusableElements.length - 1
        ];

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

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.documentElement.style.scrollBehavior =
        previousScrollBehavior;

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [navigate]);

  // ==========================================
  // AUTHENTICATION POPUP UI
  // ==========================================

  return (
    <div
      className="
        fixed inset-0 z-[100]
        overflow-y-auto
        overscroll-contain
        bg-black/10
        backdrop-blur-[4px]
        font-sans
        text-urumaya-ink
      "
    >
      <div
        className={`
          flex min-h-full
          items-center justify-center
          px-4
          ${
            compact
              ? "py-3 sm:py-4"
              : "py-6 sm:px-6 sm:py-10"
          }
        `}
      >

        {/* Authentication popup */}
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-title"
          tabIndex={-1}
          className={`
            relative
            w-full max-w-[460px]
            rounded-[28px]
            border border-white/70
            bg-[#FFFDFA]
            shadow-[0_25px_100px_rgba(0,0,0,0.25)]
            outline-none
            animate-urumaya-fade-in
            ${
              compact
                ? "px-6 py-5 sm:px-8 sm:py-6"
                : "px-6 py-8 sm:px-10 sm:py-10"
            }
          `}
        >

          {/* Close button */}
          <Link
            to="/"
            replace
            aria-label="Close authentication"
            className="
              absolute right-3 top-3
              flex h-9 w-9
              items-center justify-center
              rounded-full
              text-[#81796D]
              transition-all duration-200
              hover:bg-urumaya-ivory
              hover:text-urumaya-teal
            "
          >
            <X size={20} />
          </Link>

          {/* Original URUMAYA logo */}
          <div
            className={`
              flex justify-center
              ${
                compact
                  ? "mb-3 scale-90"
                  : "mb-7 mt-2"
              }
            `}
          >
            <UrumayaLogo light />
          </div>

          {/* Heading */}
          <div
            className={`
              text-center
              ${compact ? "mb-4" : "mb-7"}
            `}
          >
            <h1
              id="auth-title"
              className={`
                font-display
                font-semibold
                leading-tight
                text-urumaya-teal
                ${
                  compact
                    ? "text-[30px] sm:text-[34px]"
                    : "text-[38px] sm:text-[44px]"
                }
              `}
            >
              {title}
            </h1>

            <p
              className={`
                leading-relaxed
                text-[#81796D]
                ${
                  compact
                    ? "mt-1.5 text-xs"
                    : "mt-3 text-sm"
                }
              `}
            >
              {subtitle}
            </p>
          </div>

          {/* Login or Registration form */}
          {children}

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

  return (
    <div>
      <label
        htmlFor={id}
        className={`
          block
          text-[13px]
          font-medium
          text-urumaya-ink
          ${compact ? "mb-1" : "mb-2"}
        `}
      >
        {label}
      </label>

      <div className="relative">
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
          className={`
            w-full
            rounded-xl
            border border-[#DDD5C8]
            bg-white
            px-4
            text-sm text-urumaya-ink
            outline-none
            transition-all duration-200
            placeholder:text-[#A59D91]
            focus:border-urumaya-teal
            focus:ring-2
            focus:ring-urumaya-teal/10
            disabled:opacity-60
            ${compact ? "py-2.5" : "py-3.5"}
            ${isPassword ? "pr-12" : ""}
          `}
        />

        {/* Password visibility */}
        {isPassword && (
          <button
            type="button"
            onClick={() =>
              setVisible((previous) => !previous)
            }
            aria-label={
              visible
                ? "Hide password"
                : "Show password"
            }
            aria-pressed={visible}
            className="
              absolute right-4 top-1/2
              -translate-y-1/2
              cursor-pointer
              text-[#81796D]
              transition-colors
              hover:text-urumaya-teal
            "
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
      className={`
        flex w-full
        cursor-pointer
        items-center justify-center
        gap-2
        rounded-xl
        bg-urumaya-teal
        px-5
        text-sm font-semibold
        text-white
        transition-all duration-300
        hover:bg-urumaya-forest
        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-urumaya-teal
        disabled:cursor-not-allowed
        disabled:opacity-60
        ${compact ? "py-3" : "py-4"}
      `}
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
        children
      )}
    </button>
  );
}