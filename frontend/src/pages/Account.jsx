
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Account() {
  const { user } = useAuth();

  return (
    <main className="min-h-[75vh] bg-urumaya-ivory px-6 py-16 text-urumaya-ink">
      <div className="mx-auto max-w-5xl">
        {/* Page heading */}
        <div className="mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-urumaya-terracotta">
            Your URUMAYA
          </p>

          <h1 className="mt-4 font-display text-4xl sm:text-5xl">
            My Account
          </h1>

          <p className="mt-4 text-sm text-urumaya-ink/60">
            A personal space for your journey with URUMAYA.
          </p>
        </div>

        {/* Customer profile */}
        <section className="border border-urumaya-ink/10 bg-white p-7 sm:p-10">
          <p className="text-xs uppercase tracking-[0.2em] text-urumaya-terracotta">
            Welcome Back
          </p>

          <h2 className="mt-3 font-display text-3xl">
            {user?.fullName || "URUMAYA Customer"}
          </h2>

          <p className="mt-3 text-sm text-urumaya-ink/60">
            {user?.email}
          </p>
        </section>

        {/* Account navigation */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <Link
            to="/account/orders"
            className="group border border-urumaya-ink/10 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-urumaya-terracotta">
              Your Purchases
            </span>

            <h3 className="mt-4 font-display text-2xl">
              My Orders
            </h3>

            <p className="mt-3 text-sm leading-6 text-urumaya-ink/60">
              Explore your order history and follow the
              progress of your purchases.
            </p>

            <span className="mt-7 inline-block text-sm font-medium transition-transform group-hover:translate-x-1">
              View Orders →
            </span>
          </Link>

          <Link
            to="/shop"
            className="group border border-urumaya-ink/10 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-urumaya-terracotta">
              Discover Heritage
            </span>

            <h3 className="mt-4 font-display text-2xl">
              Explore Collection
            </h3>

            <p className="mt-3 text-sm leading-6 text-urumaya-ink/60">
              Discover handcrafted creations inspired by
              Sri Lanka's rich cultural heritage.
            </p>

            <span className="mt-7 inline-block text-sm font-medium transition-transform group-hover:translate-x-1">
              Shop Collection →
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
