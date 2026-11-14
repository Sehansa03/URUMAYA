
import { useCallback, useEffect, useState } from "react";
import {
  ShoppingBag,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";

import { orderAPI } from "../api/orders";
import { useAuth } from "../context/AuthContext";
import ManagementOrderDetails from "./ManagementOrderDetails";

// ==========================================
// FILTER OPTIONS
// ==========================================

const orderStatuses = [
  { value: "", label: "All Order Statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const paymentStatuses = [
  { value: "", label: "All Payment Statuses" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

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
    ? new Date(date).toLocaleDateString("en-LK", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

// ==========================================
// MANAGEMENT ORDERS PAGE
// ==========================================

export default function ManagementOrders() {
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalOrders: 0,
    totalPages: 0,
  });

  // ========================================
  // FETCH ORDERS
  // ========================================

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await orderAPI.getManagedOrders({
        page,
        limit: 10,
        orderStatus,
        paymentStatus,
      });

      setOrders(response.data.data.orders || []);
      setPagination(response.data.data.pagination);
    } catch (err) {
      console.error("Failed to load orders:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load orders. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [page, orderStatus, paymentStatus]);

  useEffect(() => {
    if (authLoading || !["staff", "admin"].includes(user?.role)) {
      return;
    }

    loadOrders();
  }, [authLoading, user?.role, loadOrders]);

  // ========================================
  // RENDER
  // ========================================


  if (selectedOrderId) {
    return (
      <ManagementOrderDetails
        orderId={selectedOrderId}
        onBack={() => setSelectedOrderId(null)}
      />
    );
  }


  return (
    <div className="space-y-7">

      {/* PAGE INTRODUCTION */}

      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#B95035]">
            Customer Purchases
          </p>

          <p className="mt-2 max-w-xl text-sm leading-7 text-[#29251F]/60">
            View customer orders, monitor payment statuses,
            and track fulfillment progress.
          </p>
        </div>

        <button
          type="button"
          onClick={loadOrders}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-[#103D46] px-6 py-3 text-xs font-semibold text-white transition hover:bg-[#B95035] disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Refresh Orders
        </button>
      </div>

      {/* FILTERS */}

      <div className="rounded-2xl border border-[#103D46]/10 bg-white/80 p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row">

          <select
            value={orderStatus}
            onChange={(event) => {
              setOrderStatus(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by order status"
            className="flex-1 rounded-xl border border-[#103D46]/15 bg-white px-4 py-3 text-sm text-[#103D46] outline-none"
          >
            {orderStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          <select
            value={paymentStatus}
            onChange={(event) => {
              setPaymentStatus(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by payment status"
            className="flex-1 rounded-xl border border-[#103D46]/15 bg-white px-4 py-3 text-sm text-[#103D46] outline-none"
          >
            {paymentStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

        </div>
      </div>

      {/* ORDERS TABLE */}

      <div className="overflow-hidden rounded-2xl border border-[#103D46]/10 bg-white/85 shadow-sm">

        <div className="flex items-center justify-between border-b border-[#103D46]/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} className="text-[#B95035]" />

            <h3 className="font-display text-2xl text-[#103D46]">
              Orders
            </h3>
          </div>

          <span className="text-xs text-[#29251F]/50">
            {pagination.totalOrders} total
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-[#29251F]/55">
            Loading orders...
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <AlertCircle size={30} className="text-[#B95035]" />

            <p className="text-sm text-[#29251F]/70">
              {error}
            </p>

            <button
              type="button"
              onClick={loadOrders}
              className="rounded-full bg-[#103D46] px-6 py-2.5 text-xs font-semibold text-white"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-20 text-center">
            <ShoppingBag size={36} className="text-[#B95035]/60" />

            <h4 className="mt-5 font-display text-3xl text-[#103D46]">
              No orders found
            </h4>

            <p className="mt-2 text-sm text-[#29251F]/55">
              No orders match your selected filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">

              <thead className="bg-[#103D46]/5">
                <tr className="text-[10px] uppercase tracking-[0.12em] text-[#29251F]/55">
                  <th className="px-6 py-4">Order</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Payment</th>
                  <th className="px-5 py-4">Actions</th>

                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-t border-[#103D46]/10 transition hover:bg-[#F6EEDF]/50"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-[#103D46]">
                      {order.orderNumber}
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-[#103D46]">
                        {order.customer?.fullName || "Unknown Customer"}
                      </p>

                      <p className="mt-1 text-xs text-[#29251F]/50">
                        {order.customer?.email || "—"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-[#29251F]/70">
                      {formatDate(order.createdAt)}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-[#103D46]">
                      {formatPrice(order.totalAmount)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-medium capitalize ${
                          statusStyles[order.paymentStatus] ||
                          statusStyles.pending
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-medium capitalize ${
                          statusStyles[order.orderStatus] ||
                          statusStyles.pending
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <button
                          type="button"
                          onClick={() => setSelectedOrderId(order._id)}
                          className="inline-flex items-center gap-2 rounded-full border border-[#103D46]/20 px-4 py-2 text-xs font-semibold text-[#103D46] transition hover:border-[#B95035] hover:bg-[#F6EEDF] hover:text-[#B95035]"
                     >
                         <Eye size={15} />
                         View Details
                     </button>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

        {/* PAGINATION */}

        {!loading && !error && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#103D46]/10 px-6 py-4">
            <span className="text-xs text-[#29251F]/55">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((previous) => previous - 1)}
                aria-label="Previous page"
                className="rounded-lg border border-[#103D46]/15 p-2 text-[#103D46] disabled:opacity-30"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((previous) => previous + 1)}
                aria-label="Next page"
                className="rounded-lg border border-[#103D46]/15 p-2 text-[#103D46] disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
