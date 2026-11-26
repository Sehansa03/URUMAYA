import "../styles/AccountOrders.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { orderAPI } from "../api/orders";

const formatPrice = (amount) =>
  `LKR ${Number(amount || 0).toLocaleString("en-LK")}`;

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const formatStatus = (status) =>
  status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "Unknown";

const statusStyles = {
  pending: "bg-amber-50 text-amber-800",
  confirmed: "bg-emerald-50 text-emerald-800",
  processing: "bg-blue-50 text-blue-800",
  shipped: "bg-indigo-50 text-indigo-800",
  delivered: "bg-green-50 text-green-800",
  cancelled: "bg-red-50 text-red-800",
  paid: "bg-emerald-50 text-emerald-800",
  failed: "bg-red-50 text-red-800",
  refunded: "bg-slate-100 text-slate-700",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${
        statusStyles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {formatStatus(status)}
    </span>
  );
}

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

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await orderAPI.getMyOrders(page, 10);

        if (!active) return;

        setOrders(response.data.data.orders || []);
        setPagination(response.data.data.pagination);
      } catch (err) {
        if (!active) return;

        setError(
          err.response?.data?.message ||
            "Unable to load your orders. Please try again."
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    loadOrders();

    return () => {
      active = false;
    };
  }, [page, retry]);

  return (
    <main className="ua-page ua-orders-page">
      <Botanical className="ua-left" />
      <Botanical className="ua-right" />
      <div className="ua-container">
        <Link
          to="/account"
          className="ua-back"
        >
          ← Back to My Account
        </Link>

        <div className="ua-heading">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-urumaya-terracotta">
            Your URUMAYA Journey
          </p>

          <h1 className="mt-4 font-display text-4xl sm:text-5xl">
            My Orders
          </h1>
          <AccountLotus />

          <p className="mt-4 text-sm text-urumaya-ink/60">
            Revisit your purchases and follow their progress.
          </p>
        </div>

        {loading ? (
          <div className="ua-panel p-12 text-center">
            <p className="text-sm text-urumaya-ink/60">
              Loading your orders...
            </p>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="border border-red-200 bg-white p-10 text-center"
          >
            <p className="text-sm text-red-700">{error}</p>

            <button
              type="button"
              onClick={() => setRetry((current) => current + 1)}
              className="mt-5 text-sm font-medium text-urumaya-terracotta underline"
            >
              Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="ua-panel px-6 py-16 text-center">
            <h2 className="font-display text-3xl">
              No Orders Yet
            </h2>

            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-urumaya-ink/60">
              Your collection of handcrafted treasures begins here.
            </p>

            <Link
              to="/shop"
              className="mt-8 inline-block rounded-full bg-urumaya-forest px-8 py-3 text-xs font-semibold uppercase tracking-wider text-white"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-5">
              {orders.map((order) => (
                <article
                  key={order._id}
                  className="ua-panel p-6 sm:p-8"
                >
                  <div className="flex flex-wrap items-start justify-between gap-5">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.15em] text-urumaya-ink/50">
                        Order Reference
                      </p>

                      <h2 className="mt-2 font-display text-xl sm:text-2xl">
                        {order.orderNumber}
                      </h2>

                      <p className="mt-2 text-xs text-urumaya-ink/55">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <StatusBadge status={order.orderStatus} />
                  </div>

                  <div className="mt-6 flex flex-wrap gap-4 border-y border-urumaya-ink/10 py-5">
                    {order.items?.map((item) => (
                      <div
                        key={`${order._id}-${item.product}`}
                        className="flex min-w-0 items-center gap-3"
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-16 w-16 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="h-16 w-16 bg-urumaya-ivory" />
                        )}

                        <div className="max-w-48">
                          <p className="text-sm font-medium">
                            {item.name}
                          </p>

                          <p className="mt-1 text-xs text-urumaya-ink/55">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap items-end justify-between gap-5">
                    <div>
                      <p className="text-xs text-urumaya-ink/55">
                        Total Amount
                      </p>

                      <p className="mt-1 ua-price text-2xl">
                        {formatPrice(order.totalAmount)}
                      </p>

                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-urumaya-ink/55">
                          Payment:
                        </span>

                        <StatusBadge status={order.paymentStatus} />
                      </div>
                    </div>

                    <Link
                      to={`/account/orders/${order._id}`}
                      className="inline-flex items-center rounded-full border border-urumaya-forest px-6 py-3 text-xs font-semibold uppercase tracking-wider text-urumaya-forest transition-colors hover:bg-urumaya-forest hover:text-white"
                    >
                      View Details →
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-5">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((current) => current - 1)}
                  className="rounded-full border border-urumaya-ink/20 px-5 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="text-sm text-urumaya-ink/70">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <button
                  type="button"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-full border border-urumaya-ink/20 px-5 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
