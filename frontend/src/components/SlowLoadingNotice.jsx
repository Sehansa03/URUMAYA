import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function SlowLoadingNotice({
  loading,
  delay = 5000,
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);

    if (!loading) return;

    const timer = window.setTimeout(() => {
      setVisible(true);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [loading, delay]);

  if (!loading || !visible) return null;

  return (
    <div
      role="status"
      className="
        mx-auto my-5 flex max-w-xl
        items-center justify-center gap-3
        rounded-xl border border-[#D9CBB5]
        bg-[#FFF9ED] px-5 py-4
        text-left text-[#123E32]
      "
    >
      <Loader2
        size={24}
        className="shrink-0 motion-safe:animate-spin"
        aria-hidden="true"
      />

      <div>
        <p className="text-sm font-semibold">
          Preparing your experience
        </p>

        <p className="mt-1 text-xs leading-relaxed opacity-75">
          Our treasures are taking a little longer
          to load. Thank you for your patience.
        </p>
      </div>
    </div>
  );
}
