
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  MapPin,
  UserRound,
  CreditCard,
  Truck,
} from "lucide-react";

import { orderAPI } from "../api/orders";

const statusStyles = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-700",
  paid: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-slate-100 text-slate-700",
};

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(amount ?? 0);

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleString("en-LK", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-medium capitalize ${
        statusStyles[status] || statusStyles.pending
      }`}
    >
      {status || "Unknown"}
    </span>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 py-2 text-sm">
      <span className="text-[#29251F]/55">{label}</span>
      <span className="font-medium text-[#103D46]">
        {value ?? "—"}
      </span>
    </div>
  );
}

export default function ManagementOrderDetails({
  orderId,
  onBack,
}) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");


  useEffect(() => {
    let active = true;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError("");
        setOrder(null);

        const response =
          await orderAPI.getManagedOrderById(orderId);

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

    if (orderId) {
      fetchOrder();
    }

    return () => {
      active = false;
    };
  }, [orderId]);

  const address = order?.shippingAddress;

const statusTransitions = {
  confirmed: "processing",
  processing: "shipped",
  shipped: "delivered",
};

const nextStatus =
  order?.paymentStatus === "paid"
    ? statusTransitions[order?.orderStatus]
    : null;

const handleStatusUpdate = async () => {
  if (!order || !nextStatus || updatingStatus) return;

  setUpdateError("");
  setUpdateSuccess("");

  const payload = { status: nextStatus };

  if (nextStatus === "shipped") {
    const trimmedTrackingNumber = trackingNumber.trim();

    if (
      !trimmedTrackingNumber ||
      trimmedTrackingNumber.length > 100
    ) {
      setUpdateError(
        "Please enter a tracking number between 1 and 100 characters."
      );
      return;
    }

    payload.trackingNumber = trimmedTrackingNumber;
  }

  try {
    setUpdatingStatus(true);

    const response = await orderAPI.updateManagedOrderStatus(
      orderId,
      payload
    );

    setOrder(response.data.data);
    setTrackingNumber("");
    setUpdateSuccess(
      `Order successfully updated to ${nextStatus}.`
    );
  } catch (err) {
    setUpdateError(
      err.response?.data?.message ||
        "Unable to update order status. Please try again."
    );
  } finally {
    setUpdatingStatus(false);
  }
};


  const addressLines = address
    ? [
        address.fullName,
        address.phone,
        address.addressLine1,
        address.addressLine2,
        address.city,
        address.district,
        address.province,
        address.postalCode,
        address.country,
      ].filter(Boolean)
    : [];

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[#103D46] hover:text-[#B95035]"
          >
            <ArrowLeft size={17} />
            Back to Orders
          </button>

          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#B95035]">
            Order Management
          </p>

          <h2 className="mt-2 font-display text-3xl text-[#103D46]">
            {order?.orderNumber || "Order Details"}
          </h2>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white p-12 text-center text-sm text-[#29251F]/60">
          <RefreshCw
            size={24}
            className="mx-auto mb-4 animate-spin text-[#B95035]"
          />
          Loading order details...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-100 bg-white p-10 text-center">
          <AlertCircle
            size={28}
            className="mx-auto mb-4 text-red-600"
          />
          <p className="text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={onBack}
            className="mt-5 rounded-full bg-[#103D46] px-6 py-2.5 text-xs font-semibold text-white"
          >
            Return to Orders
          </button>
        </div>
      ) : order ? (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={order.orderStatus} />
            <StatusBadge status={order.paymentStatus} />
            <span className="text-xs text-[#29251F]/50">
              Placed {formatDate(order.createdAt)}
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-[#103D46]/10 bg-white p-6 shadow-sm">
              <h3 className="mb-5 flex items-center gap-2 font-display text-xl text-[#103D46]">
                <UserRound size={19} />
                Customer Information
              </h3>

              <InfoRow
                label="Name"
                value={order.customer?.fullName}
              />
              <InfoRow
                label="Email"
                value={order.customer?.email}
              />
            </section>

            <section className="rounded-2xl border border-[#103D46]/10 bg-white p-6 shadow-sm">
              <h3 className="mb-5 flex items-center gap-2 font-display text-xl text-[#103D46]">
                <MapPin size={19} />
                Shipping Address
              </h3>

              {addressLines.length ? (
                <div className="space-y-1 text-sm leading-7 text-[#29251F]/75">
                  {addressLines.map((line, index) => (
                    <p key={`${index}-${line}`}>{line}</p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#29251F]/55">
                  Shipping address unavailable.
                </p>
              )}
            </section>
          </div>

          <section className="overflow-hidden rounded-2xl border border-[#103D46]/10 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-[#103D46]/10 px-6 py-5">
              <ShoppingBag
                size={20}
                className="text-[#B95035]"
              />
              <h3 className="font-display text-xl text-[#103D46]">
                Purchased Products
              </h3>
            </div>

            <div className="divide-y divide-[#103D46]/10">
              {order.items?.map((item, index) => (
                <div
                  key={`${item.product}-${index}`}
                  className="flex flex-wrap items-center justify-between gap-4 p-6"
                >
                  <div className="flex items-center gap-4">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#F6EEDF]">
                        <ShoppingBag
                          size={22}
                          className="text-[#B95035]"
                        />
                      </div>
                    )}

                    <div>
                      <p className="font-medium text-[#103D46]">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs text-[#29251F]/55">
                        SKU: {item.sku || "—"}
                      </p>
                      <p className="mt-1 text-xs text-[#29251F]/55">
                        {formatPrice(item.unitPrice)} ×{" "}
                        {item.quantity}
                      </p>
                    </div>
                  </div>

                  <p className="font-semibold text-[#103D46]">
                    {formatPrice(item.totalPrice)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-[#103D46]/10 bg-white p-6 shadow-sm">
              <h3 className="mb-5 flex items-center gap-2 font-display text-xl text-[#103D46]">
                <CreditCard size={19} />
                Payment Summary
              </h3>

              <InfoRow
                label="Payment Method"
                value={order.paymentMethod}
              />
              <InfoRow
                label="Payment Status"
                value={<StatusBadge status={order.paymentStatus} />}
              />
              <InfoRow
                label="Paid At"
                value={formatDate(order.paidAt)}
              />

              <div className="my-3 border-t border-[#103D46]/10" />

              <InfoRow
                label="Subtotal"
                value={formatPrice(order.subtotal)}
              />
              <InfoRow
                label="Shipping Fee"
                value={formatPrice(order.shippingFee)}
              />

              <div className="mt-3 flex justify-between border-t border-[#103D46]/10 pt-4">
                <span className="font-semibold text-[#103D46]">
                  Total
                </span>
                <span className="text-xl font-semibold text-[#103D46]">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </section>

            <section className="rounded-2xl border border-[#103D46]/10 bg-white p-6 shadow-sm">
              <h3 className="mb-5 flex items-center gap-2 font-display text-xl text-[#103D46]">
                <Truck size={19} />
                Fulfillment Information
              </h3>

              <InfoRow
                label="Order Status"
                value={<StatusBadge status={order.orderStatus} />}
              />
              <InfoRow
                label="Tracking Number"
                value={order.trackingNumber || "Not assigned"}
              />
              <InfoRow
                label="Shipped At"
                value={formatDate(order.shippedAt)}
              />
              <InfoRow
                label="Delivered At"
                value={formatDate(order.deliveredAt)}
              />
              <InfoRow
                label="Cancelled At"
                value={formatDate(order.cancelledAt)}
              />
            </section>
          </div>

<section className="rounded-2xl border border-[#103D46]/10 bg-white p-6 shadow-sm">
  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
    <div>
      <h3 className="flex items-center gap-2 font-display text-xl text-[#103D46]">
        <Truck size={19} />
        Update Order Status
      </h3>
      <p className="mt-2 text-sm text-[#29251F]/60">
        Manage the fulfillment progress of this order.
      </p>
    </div>

    <StatusBadge status={order.orderStatus} />
  </div>

  {updateError && (
    <div
      role="alert"
      className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {updateError}
    </div>
  )}

  {updateSuccess && (
    <div
      role="status"
      className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
    >
      {updateSuccess}
    </div>
  )}

  {nextStatus ? (
    <div className="space-y-4">
      <p className="text-sm text-[#29251F]/70">
        Next fulfillment stage:{" "}
        <span className="font-semibold capitalize text-[#103D46]">
          {nextStatus}
        </span>
      </p>

      {nextStatus === "shipped" && (
        <div>
          <label
            htmlFor="tracking-number"
            className="mb-2 block text-sm font-medium text-[#103D46]"
          >
            Tracking Number
          </label>

          <input
            id="tracking-number"
            type="text"
            maxLength={100}
            value={trackingNumber}
            onChange={(event) =>
              setTrackingNumber(event.target.value)
            }
            placeholder="Enter shipment tracking number"
            disabled={updatingStatus}
            className="w-full rounded-xl border border-[#103D46]/20 bg-white px-4 py-3 text-sm text-[#103D46] outline-none transition focus:border-[#B95035] focus:ring-2 focus:ring-[#B95035]/15 disabled:opacity-60"
          />
        </div>
      )}

      <button
        type="button"
        onClick={handleStatusUpdate}
        disabled={
          updatingStatus ||
          (nextStatus === "shipped" &&
            !trackingNumber.trim())
        }
        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#103D46] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#B95035] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {updatingStatus ? (
          <>
            <RefreshCw size={16} className="animate-spin" />
            Updating...
          </>
        ) : (
          `Mark as ${nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}`
        )}
      </button>
    </div>
  ) : (
    <p className="rounded-xl bg-[#F6EEDF] px-4 py-3 text-sm text-[#103D46]">
      {order.orderStatus === "delivered"
        ? "This order has been delivered. No further fulfillment updates are available."
        : order.orderStatus === "cancelled"
          ? "This order has been cancelled. No further fulfillment updates are available."
          : order.paymentStatus !== "paid"
            ? "Fulfillment updates are available after successful payment."
            : "No further fulfillment updates are available for this order."}
    </p>
  )}
</section>

        </>
      ) : null}
    </div>
  );
}
