
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";

const COLORS = [
  "#103D46",
  "#B95035",
  "#E6AD51",
  "#168A89",
  "#5F6B44",
  "#B7A99A",
];

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("en-LK");

const formatCurrency = (value) =>
  `Rs. ${formatNumber(value)}`;

const monthLabel = (value) => {
  const [year, month] = value.split("-").map(Number);

  return new Date(
    Date.UTC(year, month - 1, 1)
  ).toLocaleDateString("en-US", {
    month: "short",
  });
};

const capitalize = (value) =>
  value.charAt(0).toUpperCase() + value.slice(1);

function ChartCard({ title, subtitle, children }) {
  return (
    <section className="min-w-0 rounded-2xl border border-[#103D46]/10 bg-white/80 p-5 shadow-sm sm:p-7">
      <div className="mb-6">
        <h3 className="font-display text-3xl text-[#103D46]">
          {title}
        </h3>

        <p className="mt-1 text-sm text-[#29251F]/55">
          {subtitle}
        </p>
      </div>

      {children}
    </section>
  );
}

function EmptyChart({ message }) {
  return (
    <div className="flex h-[260px] items-center justify-center rounded-xl bg-[#F6EEDF]/60 px-5 text-center text-sm text-[#29251F]/55">
      {message}
    </div>
  );
}

export default function ManagementAnalytics({ data }) {
  const monthlySales = data?.monthlySales || [];
  const orderStatuses = data?.orderStatuses || [];
  const topProducts = data?.topProducts || [];

  const hasSales = monthlySales.some(
    (item) => item.orders > 0
  );

  const activeStatuses = orderStatuses
    .filter((item) => item.count > 0)
    .map((item) => ({
      ...item,
      label: capitalize(item.status),
    }));

  const hasOrders = activeStatuses.length > 0;
  const hasProducts = topProducts.length > 0;

  return (
    <div className="mt-9 space-y-6">
      {/* Section heading */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#B95035]">
          Business Insights
        </p>

        

        
      </div>

      {/* Monthly sales */}
      <ChartCard
        title="Monthly Sales Performance"
        subtitle="Revenue from paid demo orders · Last 12 months"
      >
        {hasSales ? (
          <div className="h-[310px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlySales}
                margin={{
                  top: 10,
                  right: 12,
                  left: 4,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  stroke="#103D46"
                  strokeOpacity={0.08}
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  tickFormatter={monthLabel}
                  tick={{
                    fill: "#786F66",
                    fontSize: 12,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tickFormatter={(value) =>
                    value >= 1000
                      ? `${formatNumber(value / 1000)}k`
                      : formatNumber(value)
                  }
                  tick={{
                    fill: "#786F66",
                    fontSize: 12,
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={58}
                />

                <Tooltip
                  formatter={(value) => [
                    formatCurrency(value),
                    "Demo Revenue",
                  ]}
                  labelFormatter={(value) => value}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #103D4620",
                    backgroundColor: "#FFFFFF",
                    fontSize: 13,
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#B95035"
                  strokeWidth={3}
                  dot={{
                    fill: "#B95035",
                    r: 3,
                  }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyChart message="No paid demo orders in the last 12 months." />
        )}
      </ChartCard>

      {/* Two smaller charts */}
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="Order Status Distribution"
          subtitle="Current status of all customer orders"
        >
          {hasOrders ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activeStatuses}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="43%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {activeStatuses.map((item, index) => (
                      <Cell
                        key={item.status}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value) => [
                      formatNumber(value),
                      "Orders",
                    ]}
                  />

                  <Legend
                    verticalAlign="bottom"
                    wrapperStyle={{
                      fontSize: 12,
                      paddingTop: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart message="No customer orders yet." />
          )}
        </ChartCard>

        <ChartCard
          title="Top Selling Products"
          subtitle="Top 5 products by paid units sold"
        >
          {hasProducts ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProducts}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 15,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    stroke="#103D46"
                    strokeOpacity={0.08}
                    horizontal={false}
                  />

                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{
                      fill: "#786F66",
                      fontSize: 12,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={115}
                    tick={{
                      fill: "#786F66",
                      fontSize: 11,
                    }}
                    tickFormatter={(name) =>
                      name.length > 17
                        ? `${name.slice(0, 16)}…`
                        : name
                    }
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    formatter={(value) => [
                      formatNumber(value),
                      "Units Sold",
                    ]}
                  />

                  <Bar
                    dataKey="unitsSold"
                    fill="#103D46"
                    radius={[0, 6, 6, 0]}
                    maxBarSize={34}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart message="No paid product sales yet." />
          )}
        </ChartCard>
      </div>


    </div>
  );
}
