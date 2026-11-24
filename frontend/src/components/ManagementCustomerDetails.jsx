import { useEffect, useRef, useState } from "react";

import {
  X,
  UserRound,
  Mail,
  Phone,
  CalendarDays,
  ShoppingBag,
  Wallet,
  PackageCheck,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import { customerAPI } from "../api/customers";

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-LK", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "Asia/Colombo",
      })
    : "—";

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(amount ?? 0);

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

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-medium capitalize ${
        statusStyles[status] ||
        "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-xl bg-[#103D46]/5 p-3 text-[#103D46]">
        <Icon size={18} />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-[#29251F]/50">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium text-[#103D46]">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-[#103D46]/10 bg-[#F6EEDF]/45 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-[#29251F]/60">
          {label}
        </p>

        <Icon
          size={17}
          className="shrink-0 text-[#B95035]"
        />
      </div>

      <p className="mt-4 break-words text-xl font-semibold text-[#103D46]">
        {value}
      </p>
    </div>
  );
}

export default function ManagementCustomerDetails({
  customerId,
  onClose,
  isAdmin,
}) {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  // Load customer details
  useEffect(() => {
    let cancelled = false;

    const loadDetails = async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await customerAPI.getCustomerById(
            customerId,
            page,
            5
          );

        if (!cancelled) {
          setData(response.data.data);
        }
      } catch (err) {
        if (!cancelled) {
          setData(null);

          setError(
            err.response?.data?.message ||
              "Unable to load customer details."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDetails();

    return () => {
      cancelled = true;
    };
  }, [customerId, page, retry]);

  // Modal accessibility and scroll locking
  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeRef.current();
      }

      if (event.key === "Tab") {
        const elements =
          dialogRef.current?.querySelectorAll(
            'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex="0"]'
          );

        if (!elements?.length) return;

        const first = elements[0];
        const last = elements[elements.length - 1];

        if (
          event.shiftKey &&
          (
            document.activeElement === first ||
            document.activeElement === dialogRef.current
          )
        ) {
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

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      previousFocus?.focus();
    };
  }, []);

  const customer = data?.customer;
  const statistics = data?.statistics;
  const orders = data?.orders || [];
  const pagination = data?.pagination;

  const initials =
    customer?.fullName
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "C";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-details-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[26px] bg-[#FFFDFA] shadow-2xl outline-none"
      >
        {/* HEADER */}

        <header className="flex shrink-0 items-center justify-between border-b border-[#103D46]/10 px-6 py-5 sm:px-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B95035]">
              URUMAYA / Customers
            </p>

            <h2
              id="customer-details-title"
              className="mt-2 font-display text-3xl text-[#103D46]"
            >
              Customer Details
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close customer details"
            className="rounded-full p-2 text-[#103D46] transition hover:bg-[#103D46]/10"
          >
            <X size={23} />
          </button>
        </header>

        <div className="management-scroll min-h-0 flex-1 overflow-y-auto p-6 sm:p-8">
          {loading ? (
            <div
              role="status"
              className="flex flex-col items-center justify-center gap-4 py-24 text-[#103D46]"
            >
              <LoaderCircle
                size={30}
                className="animate-spin"
              />

              <p className="text-sm">
                Loading customer details...
              </p>
            </div>
          ) : error ? (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700"
            >
              <div className="flex items-center gap-3">
                <AlertCircle size={20} />
                <p className="text-sm">{error}</p>
              </div>

              <button
                type="button"
                onClick={() => setRetry((n) => n + 1)}
                className="mt-4 rounded-xl bg-[#103D46] px-4 py-2 text-sm text-white"
              >
                Try Again
              </button>
            </div>
          ) : customer ? (
            <div className="space-y-8">
              {/* CUSTOMER PROFILE */}

              <section className="flex flex-wrap items-center gap-5 rounded-2xl border border-[#103D46]/10 bg-[#F6EEDF]/50 p-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#103D46] font-display text-2xl text-[#E6AD51]">
                  {initials}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="break-words font-display text-3xl text-[#103D46]">
                    {customer.fullName}
                  </h3>

                  <p className="mt-1 break-all text-sm text-[#29251F]/60">
                    {customer.email}
                  </p>
                </div>

                <span
                  className={`rounded-full px-4 py-2 text-xs font-medium ${
                    customer.isActive
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {customer.isActive
                    ? "Active"
                    : "Inactive"}
                </span>
              </section>

              {/* CONTACT INFORMATION */}

              <section>
                <h3 className="mb-5 font-display text-2xl text-[#103D46]">
                  Personal Information
                </h3>

                <div className="grid gap-5 sm:grid-cols-2">
                  <DetailItem
                    icon={UserRound}
                    label="Full Name"
                    value={customer.fullName}
                  />

                  <DetailItem
                    icon={Mail}
                    label="Email Address"
                    value={customer.email}
                  />

                  <DetailItem
                    icon={Phone}
                    label="Phone Number"
                    value={customer.phone}
                  />

                  <DetailItem
                    icon={CalendarDays}
                    label="Customer Since"
                    value={formatDate(
                      customer.createdAt
                    )}
                  />
                </div>
              </section>

              {/* CUSTOMER STATISTICS */}

              <section>
                <h3 className="mb-5 font-display text-2xl text-[#103D46]">
                  Customer Activity
                </h3>

                <div
                  className={`grid gap-4 sm:grid-cols-2 ${
                    isAdmin
                      ? "lg:grid-cols-4"
                      : "lg:grid-cols-2"
                  }`}
                >
                  <StatCard
                    icon={ShoppingBag}
                    label="Total Orders"
                    value={statistics.totalOrders}
                  />

                  <StatCard
                    icon={PackageCheck}
                    label="Delivered Orders"
                    value={statistics.deliveredOrders}
                  />

                  {isAdmin && (
                    <>
                      <StatCard
                        icon={ShoppingBag}
                        label="Paid Orders"
                        value={statistics.paidOrders}
                      />

                      <StatCard
                        icon={Wallet}
                        label="Total Spent"
                        value={formatPrice(
                          statistics.totalSpent
                        )}
                      />
                    </>
                  )}
                </div>

                <p className="mt-4 text-xs text-[#29251F]/60">
                  Last order:{" "}
                  {formatDate(
                    statistics.lastOrderAt
                  )}
                </p>
              </section>

              {/* ORDER HISTORY */}

              <section>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-2xl text-[#103D46]">
                    Order History
                  </h3>

                  <span className="text-xs text-[#29251F]/50">
                    {statistics.totalOrders} orders
                  </span>
                </div>

                {orders.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#103D46]/20 py-12 text-center">
                    <ShoppingBag
                      size={30}
                      className="mx-auto text-[#103D46]/30"
                    />

                    <p className="mt-4 text-sm text-[#29251F]/60">
                      This customer has not placed
                      any orders yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <article
                        key={order._id}
                        className="rounded-2xl border border-[#103D46]/10 p-4 sm:p-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[#103D46]">
                              {order.orderNumber}
                            </p>

                            <p className="mt-1 text-xs text-[#29251F]/50">
                              {formatDate(
                                order.createdAt
                              )}
                            </p>
                          </div>

                          {isAdmin && (
                            <p className="text-sm font-semibold text-[#103D46]">
                              {formatPrice(
                                order.totalAmount
                              )}
                            </p>
                          )}
                        </div>

                        <div className="mt-4 space-y-1">
                          {order.items?.map(
                            (item, index) => (
                              <p
                                key={index}
                                className="text-xs leading-6 text-[#29251F]/70"
                              >
                                {item.name} ×{" "}
                                {item.quantity}
                              </p>
                            )
                          )}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <StatusBadge
                            status={
                              order.orderStatus
                            }
                          />

                          <StatusBadge
                            status={
                              order.paymentStatus
                            }
                          />
                        </div>
                      </article>
                    ))}
                  </div>
                )}

                {pagination?.totalPages > 1 && (
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <p className="text-xs text-[#29251F]/60">
                      Page {page} of{" "}
                      {pagination.totalPages}
                    </p>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        aria-label="Previous orders page"
                        disabled={page <= 1}
                        onClick={() =>
                          setPage((p) => p - 1)
                        }
                        className="rounded-lg border border-[#103D46]/15 p-2 text-[#103D46] disabled:opacity-30"
                      >
                        <ChevronLeft size={18} />
                      </button>

                      <button
                        type="button"
                        aria-label="Next orders page"
                        disabled={
                          page >=
                          pagination.totalPages
                        }
                        onClick={() =>
                          setPage((p) => p + 1)
                        }
                        className="rounded-lg border border-[#103D46]/15 p-2 text-[#103D46] disabled:opacity-30"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </section>
            </div>
          ) : null}
        </div>

        {/* FOOTER */}

        <footer className="flex shrink-0 justify-end border-t border-[#103D46]/10 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#103D46] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#071F22]"
          >
            Close Details
          </button>
        </footer>
      </section>
    </div>
  );
}