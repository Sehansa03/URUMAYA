import "../styles/AccountOrders.css";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { orderAPI } from "../api/orders";

// ==========================================
// HELPERS
// ==========================================

const formatPrice = (amount) =>
  `LKR ${Number(amount || 0).toLocaleString("en-LK")}`;

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-LK", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not available";

const formatStatus = (status) =>
  status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "Unknown";

const orderStages = [
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

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
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        statusStyles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {formatStatus(status)}
    </span>
  );
}

// ==========================================
// ORDER TRACKING
// ==========================================

function OrderTracking({ order }) {
  if (order.orderStatus === "cancelled") {
    return (
      <div className="border border-red-200 bg-red-50 p-6">
        <h3 className="font-display text-xl text-red-800">
          Order Cancelled
        </h3>
        <p className="mt-2 text-sm text-red-700">
          This order has been cancelled and will not
          proceed to delivery.
        </p>
      </div>
    );
  }

  if (order.orderStatus === "pending") {
    return (
      <div className="border border-amber-200 bg-amber-50 p-6">
        <h3 className="font-display text-xl text-amber-800">
          Awaiting Payment
        </h3>
        <p className="mt-2 text-sm text-amber-700">
          This order is awaiting payment confirmation.
          Fulfillment has not started.
        </p>
      </div>
    );
  }

  const currentStage = orderStages.indexOf(order.orderStatus);

  return (
    <div className="grid gap-4 sm:grid-cols-4">
      {orderStages.map((stage, index) => {
        const completed = index <= currentStage;

        return (
          <div
            key={stage}
            className={`ua-stage border p-5 ${
              completed
                ? "border-urumaya-forest bg-urumaya-forest text-white"
                : "border-urumaya-ink/10 bg-white text-urumaya-ink/50"
            }`}
          >
            <div className="mb-3 text-sm font-semibold">
              {completed ? "✓" : `0${index + 1}`}
            </div>

            <p className="text-sm font-medium">
              {formatStatus(stage)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ==========================================
// ORDER DETAILS PAGE
// ==========================================

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

export default function OrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadOrder = async () => {
      setLoading(true);
      setError("");
      setOrder(null);

      try {
        const response = await orderAPI.getOrderById(id);

        if (active) {
          setOrder(response.data.data);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to retrieve order details."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadOrder();

    return () => {
      active = false;
    };
  }, [id]);

  return (
    <main className="ua-page">
      <Botanical className="ua-left" />
      <Botanical className="ua-right" />
      <div className="ua-container">
        <Link
          to="/account/orders"
          className="ua-back"
        >
          ← Back to My Orders
        </Link>

        {loading ? (
          <p className="mt-12 text-sm">
            Loading order details...
          </p>
        ) : error ? (
          <div
            role="alert"
            className="mt-10 border border-red-200 bg-white p-8"
          >
            <p className="text-sm text-red-700">
              {error}
            </p>
          </div>
        ) : order ? (
          <>
            {/* HEADER */}
            <div className="ua-heading">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-urumaya-terracotta">
                Your URUMAYA Purchase
              </p>

              <h1 className="mt-4 font-display text-4xl sm:text-5xl">
                Order Details
              </h1>
          <AccountLotus />

              <p className="mt-4 text-sm text-urumaya-ink/60">
                {order.orderNumber}
              </p>

              <p className="mt-2 text-xs text-urumaya-ink/50">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>

            {/* ORDER STATUS */}
            <section className="mb-8 ua-panel p-6 sm:p-8">
              <h2 className="mb-5 font-display text-2xl">
                Order Overview
              </h2>

              <div className="flex flex-wrap gap-8">
                <div>
                  <p className="mb-2 text-xs text-urumaya-ink/50">
                    Order Status
                  </p>
                  <StatusBadge status={order.orderStatus} />
                </div>

                <div>
                  <p className="mb-2 text-xs text-urumaya-ink/50">
                    Payment Status
                  </p>
                  <StatusBadge status={order.paymentStatus} />
                </div>

                <div>
                  <p className="mb-2 text-xs text-urumaya-ink/50">
                    Total Amount
                  </p>
                  <p className="ua-price text-xl">
                    {formatPrice(order.totalAmount)}
                  </p>
                </div>
              </div>
            </section>

            {/* ORDER TRACKING */}
            <section className="mb-8">
              <h2 className="mb-5 font-display text-2xl">
                Order Progress
              </h2>

              <OrderTracking order={order} />

              {order.trackingNumber && (
                <p className="mt-5 text-sm text-urumaya-ink/70">
                  Tracking Reference:{" "}
                  <span className="font-semibold">
                    {order.trackingNumber}
                  </span>
                </p>
              )}
            </section>

            {/* PURCHASED PRODUCTS */}
            <section className="mb-8 ua-panel p-6 sm:p-8">
              <h2 className="mb-6 font-display text-2xl">
                Purchased Items
              </h2>

              <div className="divide-y divide-urumaya-ink/10">
                {order.items?.map((item) => (
                  <div
                    key={`${item.product}-${item.sku}`}
                    className="flex gap-5 py-5"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-24 w-24 rounded-xl object-cover shrink-0"
                      />
                    ) : (
                      <div className="h-24 w-24 bg-urumaya-ivory" />
                    )}

                    <div className="flex-1">
                      <h3 className="font-display text-lg">
                        {item.name}
                      </h3>

                      <p className="mt-2 text-xs text-urumaya-ink/55">
                        SKU: {item.sku}
                      </p>

                      <p className="mt-2 text-sm">
                        Quantity: {item.quantity}
                      </p>

                      <p className="mt-2 font-semibold">
                        {formatPrice(item.totalPrice)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            
{/* PRICE SUMMARY */}
<section className="ua-summary p-6 sm:p-8">
  <h2 className="mb-6 font-display text-2xl">
    Payment Summary
  </h2>

  <div className="space-y-4 text-sm">
    <div className="flex justify-between">
      <span>Subtotal</span>
      <span>{formatPrice(order.subtotal)}</span>
    </div>

    <div className="flex justify-between">
      <span>Shipping Fee</span>
      <span>{formatPrice(order.shippingFee)}</span>
    </div>

    <div className="flex justify-between ua-total pt-5 font-semibold">
      <span>Original Order Total</span>
      <span>{formatPrice(order.totalAmount)}</span>
    </div>

    {order.paymentStatus === "paid" && (
      <div className="flex justify-between text-[#dcebcf]">
        <span>Payment Received</span>
        <span className="font-semibold">
          {formatPrice(order.totalAmount)}
        </span>
      </div>
    )}

    {order.paymentStatus === "failed" && (
      <div className="border border-red-200 bg-red-50 p-4 text-red-800">
        <p className="font-semibold">
          Payment Unsuccessful
        </p>

        <p className="mt-2 text-xs leading-6">
          No payment was completed for this order.
          The order has been cancelled.
        </p>
      </div>
    )}

    {order.paymentStatus === "pending" && (
      <div className="border border-amber-200 bg-amber-50 p-4 text-amber-800">
        <p className="font-semibold">
          Payment Pending
        </p>

        <p className="mt-2 text-xs leading-6">
          Payment has not yet been completed.
        </p>
      </div>
    )}

    {order.paymentStatus === "refunded" && (
      <div className="border border-slate-200 bg-slate-50 p-4 text-slate-700">
        <p className="font-semibold">
          Payment Refunded
        </p>

        <p className="mt-2 text-xs leading-6">
          This order's payment is marked as refunded.
        </p>
      </div>
    )}
  </div>
</section>

          </>
        ) : null}
      </div>
    </main>
  );
}
