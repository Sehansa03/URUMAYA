
import { Link } from "react-router-dom";

export default function UrumayaLogo({
  className = "",
  compact = false,
  light = false,
}) {
  return (
    <Link
      to="/"
      aria-label="URUMAYA Home"
      className={`group inline-flex shrink-0 items-center gap-2 sm:gap-3 ${className}`}
    >
      <img
        src="/images/urumaya/urumaya_logo.png"
        alt=""
        aria-hidden="true"
        className="h-12 w-12 shrink-0 object-contain transition-transform duration-500 group-hover:scale-105 sm:h-14 sm:w-14"
      />

      <span className="flex flex-col items-start">
        <span
          className="font-display text-[25px] font-medium leading-none tracking-[0.15em] text-[#A47A28] transition-colors duration-300 group-hover:text-[#BD9344] sm:text-[32px]"
        >
          URUMAYA
        </span>

        {!compact && (
          <span
            className={`mt-1.5 pl-0.5 text-[7px] font-semibold uppercase tracking-[0.32em] sm:text-[8px] ${
              light
                ? "text-[#987035]"
                : "text-[#E6AD51]"
            }`}
          >
            ROOTED IN HERITAGE
          </span>
        )}
      </span>
    </Link>
  );
}
