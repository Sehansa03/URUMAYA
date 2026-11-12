
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
            className={`border p-5 ${
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
    <main className="min-h-[75vh] bg-urumaya-ivory px-5 py-14 text-urumaya-ink sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/account/orders"
          className="text-xs font-medium text-urumaya-terracotta hover:underline"
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
            <div className="mb-10 mt-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-urumaya-terracotta">
                Your URUMAYA Purchase
              </p>

              <h1 className="mt-4 font-display text-4xl sm:text-5xl">
                Order Details
              </h1>

              <p className="mt-4 text-sm text-urumaya-ink/60">
                {order.orderNumber}
              </p>

              <p className="mt-2 text-xs text-urumaya-ink/50">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>

            {/* ORDER STATUS */}
            <section className="mb-8 border border-urumaya-ink/10 bg-white p-6 sm:p-8">
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
                  <p className="font-display text-xl">
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
            <section className="mb-8 border border-urumaya-ink/10 bg-white p-6 sm:p-8">
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
                        className="h-24 w-24 object-cover"
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
<section className="border border-urumaya-ink/10 bg-white p-6 sm:p-8">
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

    <div className="flex justify-between border-t border-urumaya-ink/10 pt-5 font-semibold">
      <span>Original Order Total</span>
      <span>{formatPrice(order.totalAmount)}</span>
    </div>

    {order.paymentStatus === "paid" && (
      <div className="flex justify-between text-emerald-700">
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
