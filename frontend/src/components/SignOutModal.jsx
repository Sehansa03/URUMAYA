import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { LogOut, X } from "lucide-react";

export default function SignOutModal({
  isOpen,
  onClose,
  onConfirm,
  signingOut = false,
}) {
  const cancelRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !signingOut) {
        onClose();
      }

      if (event.key === "Tab") {
        const elements = dialogRef.current?.querySelectorAll(
          "button:not(:disabled)"
        );

        if (!elements?.length) {
          event.preventDefault();
          return;
        }

        const first = elements[0];
        const last = elements[elements.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === last
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [isOpen, onClose, signingOut]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#071F22]/60 p-4 backdrop-blur-sm"
      onClick={() => {
        if (!signingOut) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="signout-title"
        aria-describedby="signout-description"
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-[400px] rounded-2xl border border-[#D9CBB5] bg-[#FFFDFA] p-7 shadow-2xl"
      >
        <button
          type="button"
          aria-label="Close confirmation"
          disabled={signingOut}
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-[#81796D] transition-colors hover:bg-[#F6EEDF] disabled:opacity-50"
        >
          <X size={19} />
        </button>

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F6EEDF] text-[#B95035]">
          <LogOut size={25} strokeWidth={1.7} />
        </div>

        <h2
          id="signout-title"
          className="text-center font-display text-3xl font-semibold text-[#103D46]"
        >
          Sign out?
        </h2>

        <p
          id="signout-description"
          className="mx-auto mt-3 max-w-[280px] text-center text-sm leading-relaxed text-[#81796D]"
        >
          Are you sure you want to sign out of your
          URUMAYA account?
        </p>

        <div className="mt-7 grid grid-cols-2 gap-3">
          <button
            ref={cancelRef}
            type="button"
            disabled={signingOut}
            onClick={onClose}
            className="rounded-lg border border-[#D9CBB5] px-4 py-3 text-sm font-semibold text-[#103D46] transition-colors hover:bg-[#F6EEDF] disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={signingOut}
            onClick={onConfirm}
            className="rounded-lg bg-[#103D46] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#071F22] disabled:opacity-60"
          >
            {signingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}