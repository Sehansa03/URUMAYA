
import { useEffect, useState } from "react";

import {
  Download,
  RefreshCw,
  CalendarDays,
  Wallet,
  ShoppingBag,
  CheckCircle2,
  TrendingUp,
  Package,
  Users,
  Boxes,
  AlertCircle,
  LoaderCircle,
  BarChart3,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { reportAPI } from "../api/reports";
import { generateReportPDF } from "../utils/reportPDF";
import { useAuth } from "../context/AuthContext";

const COLORS = [
  "#103D46",
  "#B95035",
  "#E6AD51",
  "#74958C",
  "#A99578",
  "#D5C6AF",
];

const TABS = [
  "Sales",
  "Products",
  "Customers",
  "Orders",
  "Inventory",
];

const number = (value) =>
  Number(value || 0).toLocaleString("en-LK");

const money = (value) =>
  `LKR ${Number(value || 0).toLocaleString(
    "en-LK",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;

const dateKey = (date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

const getInitialRange = () => {
  const today = dateKey();

  return {
    startDate: `${today.slice(0, 7)}-01`,
    endDate: today,
  };
};

const formatDate = (value) =>
  new Date(`${value}T00:00:00Z`).toLocaleDateString(
    "en-GB",
    {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }
  );


function StatCard({ label, value, icon: Icon, note }) {
  return (
    <div className="rounded-2xl border border-[#103D46]/10 bg-white/80 p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-[#29251F]/60">
          {label}
        </p>

        <div className="rounded-xl bg-[#B95035]/10 p-2.5 text-[#B95035]">
          <Icon size={19} strokeWidth={1.8} />
        </div>
      </div>

      <p className="font-number mt-4 break-words text-2xl font-medium text-[#103D46]">
        {value}
      </p>

      {note && (
        <p className="mt-2 text-xs leading-5 text-[#29251F]/45">
          {note}
        </p>
      )}
    </div>
  );
}

function Section({ title, description, children }) {
  return (
    <section className="min-w-0 rounded-2xl border border-[#103D46]/10 bg-white/80 p-5 shadow-sm sm:p-7">
      <h3 className="font-display text-3xl text-[#103D46]">
        {title}
      </h3>

      {description && (
        <p className="mt-1 text-xs leading-6 text-[#29251F]/55">
          {description}
        </p>
      )}

      <div className="mt-6">{children}</div>
    </section>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-xl bg-[#F6EEDF]/50 p-6 text-center">
      <BarChart3
        size={30}
        strokeWidth={1.4}
        className="text-[#103D46]/35"
      />

      <p className="text-sm text-[#29251F]/55">
        {message}
      </p>
    </div>
  );
}

function StatusChart({ title, data }) {
  const chartData = data.filter(
    (item) => item.count > 0
  );

  return (
    <Section title={title}>
      {chartData.length === 0 ? (
        <EmptyState message="No orders in this period." />
      ) : (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="status"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
              >
                {chartData.map((item) => (
                  <Cell
                    key={item.status}
                    fill={
                      COLORS[
                        data.findIndex(
                          (entry) =>
                            entry.status === item.status
                        ) % COLORS.length
                      ]
                    }
                  />
                ))}
              </Pie>

              <Tooltip />

              <Legend
                formatter={(value) => (
                  <span className="text-xs capitalize text-[#29251F]/70">
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {data.map((item) => (
          <div
            key={item.status}
            className="flex items-center justify-between border-b border-[#103D46]/5 pb-3 text-sm last:border-0"
          >
            <span className="capitalize text-[#29251F]/65">
              {item.status}
            </span>

            <span className="font-medium text-[#103D46]">
              {number(item.count)}
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}

export default function ManagementReports() {
  const { user } = useAuth();

  const [range, setRange] = useState(getInitialRange);
  const [appliedRange, setAppliedRange] =
    useState(getInitialRange);

  const [activeTab, setActiveTab] = useState("Sales");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterError, setFilterError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isAdmin) return;

    const controller = new AbortController();
    let active = true;

    const loadReports = async () => {
      setLoading(true);
      setError("");
      setData(null);

      try {
        const response = await reportAPI.getReports({
          ...appliedRange,
          signal: controller.signal,
        });

        if (active) {
          setData(response.data.data);
        }
      } catch (err) {
        if (active && !controller.signal.aborted) {
          setError(
            err.response?.data?.message ||
              "Unable to load reports. Please try again."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadReports();

    return () => {
      active = false;
      controller.abort();
    };
  }, [isAdmin, appliedRange, refreshKey]);

  const applyFilters = (event) => {
    event.preventDefault();
    setFilterError("");

    if (
      !range.startDate ||
      !range.endDate ||
      range.startDate > range.endDate
    ) {
      setFilterError("Please select a valid date range.");
      return;
    }

    const days =
      (new Date(range.endDate) -
        new Date(range.startDate)) /
        86400000 +
      1;

    if (days > 366) {
      setFilterError(
        "Please select a date range of 366 days or less."
      );
      return;
    }

    setAppliedRange({ ...range });
  };

  const applyPreset = (preset) => {
    const today = dateKey();
    let startDate;

    if (preset === "month") {
      startDate = `${today.slice(0, 7)}-01`;
    } else if (preset === "year") {
      startDate = `${today.slice(0, 4)}-01-01`;
    } else {
      const days = preset === "7" ? 7 : 30;

      const start = new Date(
        Date.now() - (days - 1) * 86400000
      );

      startDate = dateKey(start);
    }

    const next = {
      startDate,
      endDate: today,
    };

    setFilterError("");
    setRange(next);
    setAppliedRange(next);
  };

  const exportReport = () => {
    if (!data || loading) return;

    try {
      generateReportPDF(data, activeTab);
    } catch (error) {
      console.error("PDF export error:", error);
      window.alert("Unable to download PDF. Please try again.");
    }
  };

  if (!isAdmin) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-8 text-sm text-red-700">
        You do not have permission to access reports.
      </div>
    );
  }

  const buttonClass =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50";

  const dateInputClass =
    "w-full rounded-xl border border-[#103D46]/15 bg-white px-4 py-3 text-sm text-[#103D46] outline-none focus:border-[#103D46]";

  return (
    <div className="space-y-7">

      {/* PAGE INTRODUCTION */}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B95035]">
            Business Intelligence
          </p>

          <h2 className="mt-2 font-display text-4xl text-[#103D46]">
            Reports & Analytics
          </h2>

          <p className="mt-2 text-sm leading-7 text-[#29251F]/60">
            Understand sales, customer activity and
            inventory performance across URUMAYA.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() =>
              setRefreshKey((value) => value + 1)
            }
            className={`${buttonClass} border border-[#103D46]/15 bg-white text-[#103D46] hover:bg-[#103D46]/5`}
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            disabled={loading || !data}
            onClick={exportReport}
            className={`${buttonClass} bg-[#103D46] text-white hover:bg-[#16515B]`}
          >
            <Download size={16} />
            Download PDF
          </button>
        </div>
      </div>

      {/* DATE FILTERS */}

      <section className="rounded-2xl border border-[#103D46]/10 bg-white/80 p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-2 text-[#103D46]">
          <CalendarDays size={18} />

          <h3 className="text-sm font-semibold">
            Reporting Period
          </h3>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {[
            ["7", "Last 7 Days"],
            ["30", "Last 30 Days"],
            ["month", "This Month"],
            ["year", "This Year"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => applyPreset(value)}
              className="rounded-lg border border-[#103D46]/10 px-3 py-2 text-xs text-[#103D46] transition hover:bg-[#103D46]/5"
            >
              {label}
            </button>
          ))}
        </div>

        <form
          onSubmit={applyFilters}
          className="grid items-end gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_auto]"
        >
          <label className="block">
            <span className="mb-2 block text-xs font-medium text-[#29251F]/65">
              From
            </span>

            <input
              type="date"
              required
              value={range.startDate}
              max={dateKey()}
              onChange={(event) =>
                setRange((previous) => ({
                  ...previous,
                  startDate: event.target.value,
                }))
              }
              className={dateInputClass}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-medium text-[#29251F]/65">
              To
            </span>

            <input
              type="date"
              required
              value={range.endDate}
              min={range.startDate}
              max={dateKey()}
              onChange={(event) =>
                setRange((previous) => ({
                  ...previous,
                  endDate: event.target.value,
                }))
              }
              className={dateInputClass}
            />
          </label>

          <button
            type="submit"
            className={`${buttonClass} min-h-[46px] bg-[#103D46] text-white hover:bg-[#16515B]`}
          >
            Apply Filters
          </button>
        </form>

        {filterError && (
          <p
            role="alert"
            className="mt-3 text-xs text-red-700"
          >
            {filterError}
          </p>
        )}

        <p className="mt-4 text-xs text-[#29251F]/50">
          Reporting period: {appliedRange.startDate} to{" "}
          {appliedRange.endDate}
        </p>
      </section>

      {/* LOADING AND ERROR STATES */}

      {loading ? (
        <div
          role="status"
          className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-2xl border border-[#103D46]/10 bg-white/80"
        >
          <LoaderCircle
            size={32}
            className="animate-spin text-[#103D46]"
          />

          <p className="text-sm text-[#29251F]/60">
            Generating reports...
          </p>
        </div>
      ) : error ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-white p-6"
        >
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle size={20} />
            <p className="text-sm">{error}</p>
          </div>

          <button
            type="button"
            onClick={() =>
              setRefreshKey((value) => value + 1)
            }
            className="mt-4 rounded-xl bg-[#103D46] px-4 py-2 text-xs text-white"
          >
            Try Again
          </button>
        </div>
      ) : data ? (
        <>

          {/* MAIN SUMMARY CARDS */}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Revenue"
              value={money(data.sales.revenue)}
              icon={Wallet}
              note="Successful mock payments"
            />

            <StatCard
              label="Total Orders"
              value={number(data.sales.totalOrders)}
              icon={ShoppingBag}
              note="Orders created in selected period"
            />

            <StatCard
              label="Paid Orders"
              value={number(data.sales.paidOrders)}
              icon={CheckCircle2}
              note="Payments completed in selected period"
            />

            <StatCard
              label="Average Order Value"
              value={money(data.sales.averageOrderValue)}
              icon={TrendingUp}
              note="Per paid order"
            />
          </div>

          {/* REPORT TABS */}

          <div className="overflow-x-auto rounded-2xl border border-[#103D46]/10 bg-white/80 p-2 shadow-sm">
            <div className="flex min-w-max gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  aria-pressed={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-xl px-5 py-3 text-sm font-medium transition ${
                    activeTab === tab
                      ? "bg-[#103D46] text-white"
                      : "text-[#29251F]/65 hover:bg-[#103D46]/5"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* SALES REPORT */}

          {activeTab === "Sales" && (
            <div className="space-y-6">
              <Section
                title="Revenue Performance"
                description="Daily revenue based on successful payments."
              >
                <div className="h-[320px] w-full">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <AreaChart
                      data={data.salesTrend}
                      margin={{
                        top: 10,
                        right: 15,
                        left: 5,
                        bottom: 5,
                      }}
                    >
                      <defs>
                        <linearGradient
                          id="reportRevenue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#103D46"
                            stopOpacity={0.22}
                          />

                          <stop
                            offset="100%"
                            stopColor="#103D46"
                            stopOpacity={0.02}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#E8E3D9"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="date"
                        tickFormatter={formatDate}
                        tick={{ fontSize: 11 }}
                        minTickGap={25}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        width={65}
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value) =>
                          number(value)
                        }
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip
                        labelFormatter={formatDate}
                        formatter={(value) => [
                          money(value),
                          "Revenue",
                        ]}
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid #E8E3D9",
                        }}
                      />

                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#103D46"
                        strokeWidth={2.5}
                        fill="url(#reportRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Section>

              <div className="grid gap-5 sm:grid-cols-2">
                <StatCard
                  label="Product Revenue"
                  value={money(data.sales.productRevenue)}
                  icon={Package}
                  note="Excluding delivery charges"
                />

                <StatCard
                  label="Shipping Revenue"
                  value={money(data.sales.shippingRevenue)}
                  icon={ShoppingBag}
                  note="Delivery charges from paid orders"
                />
              </div>

              <Section
                title="Daily Paid Orders"
                description="Number of successful payments per day."
              >
                <div className="h-[270px] w-full">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart data={data.salesTrend}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#E8E3D9"
                      />

                      <XAxis
                        dataKey="date"
                        tickFormatter={formatDate}
                        tick={{ fontSize: 11 }}
                        minTickGap={25}
                      />

                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11 }}
                      />

                      <Tooltip labelFormatter={formatDate} />

                      <Bar
                        dataKey="orders"
                        name="Paid Orders"
                        fill="#B95035"
                        radius={[5, 5, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Section>
            </div>
          )}

          {/* PRODUCT PERFORMANCE */}

          {activeTab === "Products" && (
            <div className="space-y-6">
              <Section
                title="Best-Selling Products"
                description="Top 10 products ranked by units sold in paid orders."
              >
                {data.topProducts.length === 0 ? (
                  <EmptyState message="No product sales in this period." />
                ) : (
                  <div
                    style={{
                      height: Math.max(
                        260,
                        data.topProducts.length * 45 + 50
                      ),
                    }}
                  >
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <BarChart
                        data={data.topProducts}
                        layout="vertical"
                        margin={{
                          left: 5,
                          right: 20,
                        }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                          stroke="#E8E3D9"
                        />

                        <XAxis
                          type="number"
                          allowDecimals={false}
                          tick={{ fontSize: 11 }}
                        />

                        <YAxis
                          type="category"
                          dataKey="name"
                          width={120}
                          tick={{ fontSize: 10 }}
                          tickFormatter={(value) =>
                            value.length > 18
                              ? `${value.slice(0, 18)}...`
                              : value
                          }
                        />

                        <Tooltip />

                        <Bar
                          dataKey="unitsSold"
                          name="Units Sold"
                          fill="#103D46"
                          radius={[0, 6, 6, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Section>

              <Section title="Product Sales Breakdown">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left text-sm">
                    <thead className="bg-[#F6EEDF]/70 text-xs text-[#103D46]">
                      <tr>
                        {[
                          "Rank",
                          "Product",
                          "SKU",
                          "Units Sold",
                          "Revenue",
                        ].map((heading) => (
                          <th
                            key={heading}
                            className="px-4 py-4 font-medium"
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {data.topProducts.map((item, index) => (
                        <tr
                          key={item._id}
                          className="border-b border-[#103D46]/5"
                        >
                          <td className="px-4 py-4 text-[#B95035]">
                            {index + 1}
                          </td>

                          <td className="px-4 py-4 font-medium text-[#103D46]">
                            {item.name}
                          </td>

                          <td className="px-4 py-4 text-xs text-[#29251F]/55">
                            {item.sku}
                          </td>

                          <td className="px-4 py-4">
                            {number(item.unitsSold)}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 font-medium text-[#103D46]">
                            {money(item.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {data.topProducts.length === 0 && (
                    <EmptyState message="No product sales available." />
                  )}
                </div>
              </Section>
            </div>
          )}

          {/* CUSTOMER REPORT */}

          {activeTab === "Customers" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Registered Customers"
                  value={number(
                    data.customers.totalCustomers
                  )}
                  icon={Users}
                  note="Current total"
                />

                <StatCard
                  label="New Customers"
                  value={number(
                    data.customers.newCustomers
                  )}
                  icon={Users}
                  note="Registered during selected period"
                />

                <StatCard
                  label="Purchasing Customers"
                  value={number(
                    data.customers.purchasingCustomers
                  )}
                  icon={ShoppingBag}
                  note="At least one successful payment"
                />

                <StatCard
                  label="Repeat Customers"
                  value={number(
                    data.customers.repeatCustomers
                  )}
                  icon={RefreshCw}
                  note="Two or more paid orders in period"
                />
              </div>

              <Section
                title="Customer Purchase Behaviour"
                description="Repeat purchasing activity during the selected period."
              >
                {data.customers.purchasingCustomers === 0 ? (
                  <EmptyState message="No customer purchases in this period." />
                ) : (
                  <div className="py-5">
                    <p className="text-xs font-medium uppercase tracking-wider text-[#B95035]">
                      Repeat Purchase Rate
                    </p>

                    <p className="mt-4 text-5xl text-[#103D46]">
                      {data.customers.repeatPurchaseRate.toFixed(
                        1
                      )}
                      %
                    </p>

                    <div className="mt-6 h-4 overflow-hidden rounded-full bg-[#F6EEDF]">
                      <div
                        className="h-full rounded-full bg-[#103D46]"
                        style={{
                          width: `${Math.min(
                            100,
                            data.customers.repeatPurchaseRate
                          )}%`,
                        }}
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap justify-between gap-3 text-xs text-[#29251F]/60">
                      <span>
                        Repeat customers:{" "}
                        {number(
                          data.customers.repeatCustomers
                        )}
                      </span>

                      <span>
                        Purchasing customers:{" "}
                        {number(
                          data.customers.purchasingCustomers
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </Section>
            </div>
          )}

          {/* ORDER AND PAYMENT REPORT */}

          {activeTab === "Orders" && (
            <div className="space-y-5">
              <p className="text-xs leading-6 text-[#29251F]/55">
                Current order and payment statuses for
                orders created during the selected period.
              </p>

              <div className="grid gap-6 xl:grid-cols-2">
                <StatusChart
                  title="Order Status"
                  data={data.orderStatuses}
                />

                <StatusChart
                  title="Payment Status"
                  data={data.paymentStatuses}
                />
              </div>
            </div>
          )}

          {/* INVENTORY REPORT */}

          {activeTab === "Inventory" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-[#103D46]/10 bg-white/60 px-5 py-4 text-xs leading-6 text-[#29251F]/65">
                Inventory reflects current available stock
                for active, published products. It is not
                affected by the selected date range.
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Active Products"
                  value={number(
                    data.inventory.totalProducts
                  )}
                  icon={Package}
                />

                <StatCard
                  label="Available Units"
                  value={number(
                    data.inventory.totalUnits
                  )}
                  icon={Boxes}
                />

                <StatCard
                  label="Low Stock"
                  value={number(
                    data.inventory.lowStock
                  )}
                  icon={AlertCircle}
                />

                <StatCard
                  label="Out of Stock"
                  value={number(
                    data.inventory.outOfStock
                  )}
                  icon={Package}
                />
              </div>

              <StatCard
                label="Retail Stock Value"
                value={money(
                  data.inventory.retailStockValue
                )}
                icon={Wallet}
                note="Available stock multiplied by selling price. Not inventory cost or profit."
              />

              <Section
                title="Stock Attention Required"
                description="Products that have reached or fallen below their low-stock threshold."
              >
                {data.inventory.alertsTruncated && (
                  <p className="mb-4 text-xs text-[#B95035]">
                    Showing the first 50 stock alerts.
                    View Inventory for the full list.
                  </p>
                )}

                {data.inventory.alerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-green-50 p-10 text-center">
                    <CheckCircle2
                      size={30}
                      className="text-green-700"
                    />

                    <p className="text-sm text-green-800">
                      No products require stock attention.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] text-left text-sm">
                      <thead className="bg-[#F6EEDF]/70 text-xs text-[#103D46]">
                        <tr>
                          {[
                            "Product",
                            "SKU",
                            "Available Stock",
                            "Threshold",
                            "Status",
                          ].map((heading) => (
                            <th
                              key={heading}
                              className="px-4 py-4 font-medium"
                            >
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {data.inventory.alerts.map((item) => (
                          <tr
                            key={item._id}
                            className="border-b border-[#103D46]/5"
                          >
                            <td className="px-4 py-4 font-medium text-[#103D46]">
                              {item.name}
                            </td>

                            <td className="px-4 py-4 text-xs text-[#29251F]/55">
                              {item.sku}
                            </td>

                            <td className="px-4 py-4">
                              {number(item.stockQuantity)}
                            </td>

                            <td className="px-4 py-4">
                              {number(item.lowStockThreshold)}
                            </td>

                            <td className="px-4 py-4">
                              <span
                                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${
                                  item.stockQuantity === 0
                                    ? "bg-red-100 text-red-700"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {item.stockQuantity === 0
                                  ? "Out of Stock"
                                  : "Low Stock"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Section>
            </div>
          )}

          <p className="text-right text-[11px] text-[#29251F]/40">
            Last generated:{" "}
            {new Date(data.generatedAt).toLocaleString(
              "en-GB",
              {
                timeZone: "Asia/Colombo",
              }
            )}
          </p>
        </>
      ) : null}
    </div>
  );
}
