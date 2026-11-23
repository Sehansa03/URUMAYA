
const Order = require("./order.model");

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const getManagementAnalytics = async (req, res) => {
  try {
    // Last 12 calendar months, including this month.
    const now = new Date();
    const start = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1)
    );

    const [monthlySales, statusResults, topProducts] =
      await Promise.all([
        // Revenue from paid demo orders only.
        Order.aggregate([
          {
            $match: {
              paymentStatus: "paid",
              paidAt: { $gte: start },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m",
                  date: "$paidAt",
                  timezone: "Asia/Colombo",
                },
              },
              revenue: { $sum: "$totalAmount" },
              orders: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),

        // Distribution of all order statuses.
        Order.aggregate([
          {
            $group: {
              _id: "$orderStatus",
              count: { $sum: 1 },
            },
          },
        ]),

        // Best-selling products based on paid orders.
        Order.aggregate([
          { $match: { paymentStatus: "paid" } },
          { $unwind: "$items" },
          {
            $group: {
              _id: "$items.product",
              name: { $first: "$items.name" },
              unitsSold: { $sum: "$items.quantity" },
              revenue: { $sum: "$items.totalPrice" },
            },
          },
          { $sort: { unitsSold: -1, revenue: -1 } },
          { $limit: 5 },
          {
            $project: {
              _id: 0,
              name: 1,
              unitsSold: 1,
              revenue: 1,
            },
          },
        ]),
      ]);

    // Include months with no sales.
    const monthlyMap = new Map(
      monthlySales.map((item) => [item._id, item])
    );

    const months = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1)
      );

      const key = date.toISOString().slice(0, 7);
      const result = monthlyMap.get(key);

      months.push({
        month: key,
        revenue: result?.revenue ?? 0,
        orders: result?.orders ?? 0,
      });
    }

    const statusMap = new Map(
      statusResults.map((item) => [item._id, item.count])
    );

    const orderStatuses = ORDER_STATUSES.map((status) => ({
      status,
      count: statusMap.get(status) ?? 0,
    }));

    return res.status(200).json({
      success: true,
      data: {
        monthlySales: months,
        orderStatuses,
        topProducts,
      },
    });
  } catch (error) {
    console.error("Management analytics error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load management analytics",
    });
  }
};

module.exports = { getManagementAnalytics };
