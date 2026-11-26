import "../styles/AccountOrders.css";
import { UserRound, Package, ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Botanical({ className = "" }) {
  return (
    <svg
      viewBox="0 0 200 310"
      className={`ua-leaf ${className}`}
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

function AccountLotus() {
  return <div className="ua-lotus" aria-hidden="true"><span /><svg viewBox="0 0 80 60" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M40 49C25 37 27 18 40 5C53 18 55 37 40 49Z M40 49C20 48 10 32 12 17C29 18 40 31 40 49Z M40 49C60 48 70 32 68 17C51 18 40 31 40 49Z M40 49C22 58 8 47 3 32C21 28 33 37 40 49Z M40 49C58 58 72 47 77 32C59 28 47 37 40 49Z M40 49V57" /></svg><span /></div>;
}

export default function Account() {
  const { user } = useAuth();

  return (
    <main className="ua-page">
      <Botanical className="ua-left" />
      <Botanical className="ua-right" />
      <div className="ua-container">
        {/* Page heading */}
        <div className="ua-heading">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-urumaya-terracotta">
            Your URUMAYA
          </p>

          <h1 className="mt-4 font-display text-4xl sm:text-5xl">
            My Account
          </h1>
          <AccountLotus />

          <p className="mt-4 text-sm text-urumaya-ink/60">
            A personal space for your journey with URUMAYA.
          </p>
        </div>

        {/* Customer profile */}
        <section className="ua-profile">
          <div className="ua-avatar"><UserRound size={30} /></div>
          <p className="ua-profile-label">
            Welcome Back
          </p>

          <h2 className="mt-3 font-display text-3xl">
            {user?.fullName || "URUMAYA Customer"}
          </h2>

          <p className="ua-profile-email">
            {user?.email}
          </p>
        </section>

        {/* Account navigation */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <Link
            to="/account/orders"
            className="ua-nav-card group"
          >
            <div className="ua-icon"><Package size={24} /></div>
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
            className="ua-nav-card group"
          >
            <div className="ua-icon"><ShoppingBag size={24} /></div>
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
