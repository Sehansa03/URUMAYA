import { useEffect, useState } from "react";

import {
  Users,
  UserCheck,
  UserPlus,
  UserMinus,
  Repeat,
  Wallet,
  Search,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { customerAPI } from "../api/customers";

import ManagementCustomerDetails from
  "../components/ManagementCustomerDetails";

const PAGE_SIZE = 10;

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

const getInitials = (name) =>
  name
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "C";

function StatisticCard({
  icon: Icon,
  label,
  value,
  description,
  loading,
}) {
  return (
    <div className="rounded-2xl border border-[#103D46]/10 bg-white/80 p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-[#29251F]/60">
          {label}
        </p>

        <Icon
          size={20}
          strokeWidth={1.8}
          className="shrink-0 text-[#B95035]"
        />
      </div>

      <p className="mt-5 break-words text-3xl font-medium text-[#103D46]">
        {loading ? "…" : value ?? "—"}
      </p>

      <p className="mt-2 text-[11px] text-[#29251F]/50">
        {description}
      </p>
    </div>
  );
}

export default function ManagementCustomers() {
  const { user, loading: authLoading } = useAuth();

  const isAdmin = user?.role === "admin";

  const canAccess = ["admin", "staff"].includes(
    user?.role
  );

  const [customers, setCustomers] = useState([]);
  const [statistics, setStatistics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] =
    useState(true);

  const [error, setError] = useState("");
  const [statsError, setStatsError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedCustomerId, setSelectedCustomerId] =
    useState(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    totalCustomers: 0,
    totalPages: 0,
  });

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Load customer statistics
  useEffect(() => {
    if (authLoading || !canAccess) return;

    let cancelled = false;

    const loadStatistics = async () => {
      setStatsLoading(true);
      setStatsError("");

      try {
        const response =
          await customerAPI.getStatistics();

        if (!cancelled) {
          setStatistics(response.data.data);
        }
      } catch (err) {
        if (!cancelled) {
          setStatistics(null);

          setStatsError(
            err.response?.data?.message ||
              "Unable to load customer statistics."
          );
        }
      } finally {
        if (!cancelled) {
          setStatsLoading(false);
        }
      }
    };

    loadStatistics();

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    canAccess,
    user?.role,
    refreshKey,
  ]);

  // Load customer list
  useEffect(() => {
    if (authLoading || !canAccess) return;

    let cancelled = false;

    const loadCustomers = async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await customerAPI.getCustomers({
            page,
            limit: PAGE_SIZE,
            search,
            status,
          });

        if (!cancelled) {
          const result = response.data.data;

          if (
            page > 1 &&
            page > result.pagination.totalPages
          ) {
            setPage(
              Math.max(
                1,
                result.pagination.totalPages
              )
            );
            return;
          }

          setCustomers(result.customers || []);
          setPagination(result.pagination);
        }
      } catch (err) {
        if (!cancelled) {
          setCustomers([]);

          setError(
            err.response?.data?.message ||
              "Unable to load customers."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCustomers();

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    canAccess,
    user?.role,
    page,
    search,
    status,
    refreshKey,
  ]);

  const handleRefresh = () => {
    setRefreshKey((key) => key + 1);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setPage(1);
  };

  const cards = [
    {
      label: "Total Customers",
      icon: Users,
      value: statistics?.totalCustomers,
      description: "Registered customers",
    },
    {
      label: "Active Customers",
      icon: UserCheck,
      value: statistics?.activeCustomers,
      description: "Active customer accounts",
    },
    {
      label: "New Customers",
      icon: UserPlus,
      value: statistics?.newCustomers,
      description: "Joined in the last 30 days",
    },
    {
      label: "Inactive Customers",
      icon: UserMinus,
      value: statistics?.inactiveCustomers,
      description: "Inactive customer accounts",
    },
  ];

  if (isAdmin) {
    cards.push(
      {
        label: "Repeat Customers",
        icon: Repeat,
        value: statistics?.repeatCustomers,
        description: "Two or more paid orders",
      },
      {
        label: "Customer Spending",
        icon: Wallet,
        value: statistics
          ? formatPrice(
              statistics.totalCustomerSpending
            )
          : "—",
        description: "Total value of paid orders",
      }
    );
  }

  if (authLoading) {
    return (
      <div className="py-16 text-center text-sm text-[#103D46]">
        Loading workspace...
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"
      >
        You do not have permission to access
        Customer Management.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* PAGE INTRODUCTION */}

      <section className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B95035]">
            Customer Relationships
          </p>

          <h2 className="mt-2 font-display text-4xl text-[#103D46]">
            Our Customers
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#29251F]/60">
            Explore customer profiles, monitor order
            activity and understand the community
            behind URUMAYA.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading || statsLoading}
          className="inline-flex items-center gap-2 rounded-xl border border-[#103D46]/15 bg-white/70 px-4 py-3 text-sm font-medium text-[#103D46] transition hover:bg-white disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={
              loading || statsLoading
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>
      </section>

      {/* CUSTOMER STATISTICS */}

      <section
        className={`grid gap-4 sm:grid-cols-2 ${
          isAdmin
            ? "xl:grid-cols-3"
            : "xl:grid-cols-4"
        }`}
      >
        {cards.map((card) => (
          <StatisticCard
            key={card.label}
            {...card}
            loading={statsLoading}
          />
        ))}
      </section>

      {statsError && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={18} />
          {statsError}
        </div>
      )}

      {/* CUSTOMER DIRECTORY */}

      <section className="overflow-hidden rounded-2xl border border-[#103D46]/10 bg-white/85 shadow-sm">
        <div className="border-b border-[#103D46]/10 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-3xl text-[#103D46]">
                Customer Directory
              </h3>

              <p className="mt-2 text-xs text-[#29251F]/55">
                {loading
                  ? "Loading customers..."
                  : error
                    ? "Customer list unavailable"
                    : `${pagination.totalCustomers} customers found`}
              </p>
            </div>

            <span className="rounded-full bg-[#103D46]/5 px-4 py-2 text-xs font-medium text-[#103D46]">
              Read-only access
            </span>
          </div>

          {/* SEARCH AND FILTERS */}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#103D46]/45"
              />

              <input
                type="search"
                aria-label="Search customers"
                placeholder="Search by name or email..."
                value={searchInput}
                maxLength={100}
                onChange={(event) =>
                  setSearchInput(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-[#103D46]/15 bg-[#FFFDFA] py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#29251F]/40 focus:border-[#103D46]"
              />
            </div>

            <select
              aria-label="Filter customer status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-[#103D46]/15 bg-[#FFFDFA] px-4 py-3 text-sm text-[#103D46] outline-none focus:border-[#103D46]"
            >
              <option value="">
                All Statuses
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>

            {(searchInput || status) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="rounded-xl px-4 py-3 text-xs font-medium text-[#B95035] transition hover:bg-[#B95035]/5"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* TABLE CONTENT */}

        {loading ? (
          <div
            role="status"
            className="flex flex-col items-center gap-4 py-20 text-[#103D46]"
          >
            <LoaderCircle
              size={28}
              className="animate-spin"
            />

            <p className="text-sm">
              Loading customers...
            </p>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="p-8 text-center"
          >
            <AlertCircle
              size={30}
              className="mx-auto text-red-600"
            />

            <p className="mt-4 text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={handleRefresh}
              className="mt-5 rounded-xl bg-[#103D46] px-5 py-3 text-sm text-white"
            >
              Try Again
            </button>
          </div>
        ) : customers.length === 0 ? (
          <div className="px-5 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#103D46]/5">
              <Users
                size={28}
                className="text-[#103D46]/45"
              />
            </div>

            <h3 className="mt-5 font-display text-2xl text-[#103D46]">
              No Customers Found
            </h3>

            <p className="mt-2 text-sm text-[#29251F]/55">
              {search || status
                ? "Try changing your search or filters."
                : "Registered customers will appear here."}
            </p>
          </div>
        ) : (
          <>
            <div className="management-scroll overflow-x-auto">
              <table className="w-full min-w-[780px] text-left">
                <thead className="border-b border-[#103D46]/10 bg-[#F6EEDF]/60">
                  <tr className="text-[11px] font-semibold uppercase tracking-wider text-[#103D46]/70">
                    <th className="px-6 py-4">
                      Customer
                    </th>

                    <th className="px-4 py-4">
                      Joined
                    </th>

                    <th className="px-4 py-4">
                      Orders
                    </th>

                    {isAdmin && (
                      <th className="px-4 py-4">
                        Total Spent
                      </th>
                    )}

                    <th className="px-4 py-4">
                      Last Order
                    </th>

                    <th className="px-4 py-4">
                      Status
                    </th>

                    <th className="px-6 py-4 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#103D46]/10">
                  {customers.map((customer) => (
                    <tr
                      key={customer._id}
                      className="transition hover:bg-[#F6EEDF]/30"
                    >
                      {/* CUSTOMER */}

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#103D46]/10 text-sm font-semibold text-[#103D46]">
                            {getInitials(
                              customer.fullName
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[220px] truncate text-sm font-semibold text-[#103D46]">
                              {customer.fullName}
                            </p>

                            <p className="mt-1 max-w-[220px] truncate text-xs text-[#29251F]/50">
                              {customer.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* JOINED */}

                      <td className="whitespace-nowrap px-4 py-5 text-xs text-[#29251F]/70">
                        {formatDate(
                          customer.createdAt
                        )}
                      </td>

                      {/* ORDERS */}

                      <td className="px-4 py-5 text-sm font-medium text-[#103D46]">
                        {customer.totalOrders}
                      </td>

                      {/* ADMIN SPENDING */}

                      {isAdmin && (
                        <td className="whitespace-nowrap px-4 py-5 text-sm font-semibold text-[#103D46]">
                          {formatPrice(
                            customer.totalSpent
                          )}
                        </td>
                      )}

                      {/* LAST ORDER */}

                      <td className="whitespace-nowrap px-4 py-5 text-xs text-[#29251F]/70">
                        {formatDate(
                          customer.lastOrderAt
                        )}
                      </td>

                      {/* ACCOUNT STATUS */}

                      <td className="px-4 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-medium ${
                            customer.isActive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {customer.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td className="px-6 py-5 text-center">
                        <button
                          type="button"
                          title="View customer details"
                          aria-label={`View details of ${customer.fullName}`}
                          onClick={() =>
                            setSelectedCustomerId(
                              customer._id
                            )
                          }
                          className="inline-flex items-center justify-center rounded-lg border border-[#103D46]/10 p-2.5 text-[#103D46] transition hover:bg-[#103D46] hover:text-white"
                        >
                          <Eye size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#103D46]/10 px-6 py-5">
              <p className="text-xs text-[#29251F]/60">
                Showing{" "}
                {(page - 1) * PAGE_SIZE + 1}
                {" – "}
                {Math.min(
                  page * PAGE_SIZE,
                  pagination.totalCustomers
                )}
                {" of "}
                {pagination.totalCustomers} customers
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={page <= 1}
                  onClick={() =>
                    setPage((p) => p - 1)
                  }
                  className="rounded-lg border border-[#103D46]/15 p-2 text-[#103D46] transition hover:bg-[#103D46]/5 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft size={18} />
                </button>

                <span className="text-xs font-medium text-[#103D46]">
                  Page {page} of{" "}
                  {Math.max(
                    1,
                    pagination.totalPages
                  )}
                </span>

                <button
                  type="button"
                  aria-label="Next page"
                  disabled={
                    page >= pagination.totalPages
                  }
                  onClick={() =>
                    setPage((p) => p + 1)
                  }
                  className="rounded-lg border border-[#103D46]/15 p-2 text-[#103D46] transition hover:bg-[#103D46]/5 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* CUSTOMER DETAILS MODAL */}

      {selectedCustomerId && (
        <ManagementCustomerDetails
          key={selectedCustomerId}
          customerId={selectedCustomerId}
          isAdmin={isAdmin}
          onClose={() =>
            setSelectedCustomerId(null)
          }
        />
      )}
    </div>
  );
}