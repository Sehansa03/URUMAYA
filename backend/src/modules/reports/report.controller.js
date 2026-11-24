
const Order = require("../orders/order.model");
const Product = require("../products/product.model");
const User = require("../auth/user.model");

const TIMEZONE = "Asia/Colombo";
const DAY_MS = 24 * 60 * 60 * 1000;

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "refunded",
];

// Validate calendar dates and interpret them in Sri Lankan time.
const parseDate = (value) => {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return null;
  }

  const check = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(check.getTime()) ||
    check.toISOString().slice(0, 10) !== value
  ) {
    return null;
  }

  return new Date(`${value}T00:00:00+05:30`);
};

const normalizeStatuses = (results, statuses) => {
  const map = new Map(
    results.map((item) => [item._id, item.count])
  );

  return statuses.map((status) => ({
    status,
    count: map.get(status) ?? 0,
  }));
};

// GET /api/v1/reports?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
const getReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = parseDate(startDate);
    const end = parseDate(endDate);

    if (!start || !end || start > end) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid date range",
      });
    }

    const endExclusive = new Date(
      end.getTime() + DAY_MS
    );

    if (
      endExclusive.getTime() - start.getTime() >
      366 * DAY_MS
    ) {
      return res.status(400).json({
        success: false,
        message: "Date range cannot exceed 366 days",
      });
    }

    const dateFilter = {
      $gte: start,
      $lt: endExclusive,
    };

    // Sales are based on successful mock payments.
    const paidFilter = {
      paymentStatus: "paid",
      paidAt: dateFilter,
    };

    // Order activity is based on order creation date.
    const orderFilter = {
      createdAt: dateFilter,
    };

    const inventoryFilter = {
      isActive: true,
      approvalStatus: "published",
    };

    const [
      salesResults,
      totalOrders,
      dailySales,
      topProducts,
      orderStatusResults,
      paymentStatusResults,
      customerResults,
      totalCustomers,
      newCustomers,
      inventoryResults,
      inventoryAlerts,
    ] = await Promise.all([
      // 1. Revenue summary
      Order.aggregate([
        { $match: paidFilter },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$totalAmount" },
            productRevenue: { $sum: "$subtotal" },
            shippingRevenue: { $sum: "$shippingFee" },
            paidOrders: { $sum: 1 },
            averageOrderValue: { $avg: "$totalAmount" },
          },
        },
      ]),

      // 2. Total orders
      Order.countDocuments(orderFilter),

      // 3. Daily revenue trend
      Order.aggregate([
        { $match: paidFilter },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$paidAt",
                timezone: TIMEZONE,
              },
            },
            revenue: { $sum: "$totalAmount" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // 4. Best-selling products
      Order.aggregate([
        { $match: paidFilter },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            name: { $first: "$items.name" },
            sku: { $first: "$items.sku" },
            unitsSold: { $sum: "$items.quantity" },
            revenue: { $sum: "$items.totalPrice" },
          },
        },
        {
          $sort: {
            unitsSold: -1,
            revenue: -1,
            _id: 1,
          },
        },
        { $limit: 10 },
      ]),

      // 5. Order status distribution
      Order.aggregate([
        { $match: orderFilter },
        {
          $group: {
            _id: "$orderStatus",
            count: { $sum: 1 },
          },
        },
      ]),

      // 6. Payment status distribution
      Order.aggregate([
        { $match: orderFilter },
        {
          $group: {
            _id: "$paymentStatus",
            count: { $sum: 1 },
          },
        },
      ]),

      // 7. Customer purchasing activity
      Order.aggregate([
        { $match: paidFilter },
        {
          $group: {
            _id: "$customer",
            paidOrders: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: null,
            purchasingCustomers: { $sum: 1 },
            repeatCustomers: {
              $sum: {
                $cond: [
                  { $gte: ["$paidOrders", 2] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),

      // 8. Current registered customers
      User.countDocuments({
        role: "customer",
      }),

      // 9. New customers during selected period
      User.countDocuments({
        role: "customer",
        createdAt: dateFilter,
      }),

      // 10. Current inventory summary
      Product.aggregate([
        { $match: inventoryFilter },
        {
          $group: {
            _id: null,

            totalProducts: { $sum: 1 },

            totalUnits: {
              $sum: "$stockQuantity",
            },

            retailStockValue: {
              $sum: {
                $multiply: [
                  "$stockQuantity",
                  "$price",
                ],
              },
            },

            lowStock: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: ["$stockQuantity", 0] },
                      {
                        $lte: [
                          "$stockQuantity",
                          "$lowStockThreshold",
                        ],
                      },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            outOfStock: {
              $sum: {
                $cond: [
                  { $eq: ["$stockQuantity", 0] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),

      // 11. Products requiring stock attention
      Product.find({
        ...inventoryFilter,
        $expr: {
          $lte: [
            "$stockQuantity",
            "$lowStockThreshold",
          ],
        },
      })
        .select(
          "name sku category stockQuantity lowStockThreshold price"
        )
        .sort({ stockQuantity: 1, name: 1 })
        .limit(50)
        .lean(),
    ]);

    const sales = salesResults[0] || {};
    const customers = customerResults[0] || {};
    const inventory = inventoryResults[0] || {};

    // Include days without sales in the chart.
    const salesMap = new Map(
      dailySales.map((item) => [item._id, item])
    );

    const salesTrend = [];

    for (
      let timestamp = start.getTime();
      timestamp < endExclusive.getTime();
      timestamp += DAY_MS
    ) {
      const localDate = new Date(
        timestamp + 330 * 60 * 1000
      );

      const key = localDate
        .toISOString()
        .slice(0, 10);

      const item = salesMap.get(key);

      salesTrend.push({
        date: key,
        revenue: item?.revenue ?? 0,
        orders: item?.orders ?? 0,
      });
    }

    const purchasingCustomers =
      customers.purchasingCustomers ?? 0;

    const repeatCustomers =
      customers.repeatCustomers ?? 0;

    return res.status(200).json({
      success: true,

      data: {
        period: {
          startDate,
          endDate,
          timezone: TIMEZONE,
        },

        generatedAt: new Date(),

        sales: {
          revenue: sales.revenue ?? 0,
          productRevenue: sales.productRevenue ?? 0,
          shippingRevenue: sales.shippingRevenue ?? 0,
          totalOrders,
          paidOrders: sales.paidOrders ?? 0,
          averageOrderValue:
            sales.averageOrderValue ?? 0,
        },

        salesTrend,

        topProducts,

        orderStatuses: normalizeStatuses(
          orderStatusResults,
          ORDER_STATUSES
        ),

        paymentStatuses: normalizeStatuses(
          paymentStatusResults,
          PAYMENT_STATUSES
        ),

        customers: {
          totalCustomers,
          newCustomers,
          purchasingCustomers,
          repeatCustomers,

          repeatPurchaseRate:
            purchasingCustomers > 0
              ? (repeatCustomers /
                  purchasingCustomers) *
                100
              : 0,
        },

        inventory: {
          totalProducts: inventory.totalProducts ?? 0,
          totalUnits: inventory.totalUnits ?? 0,
          retailStockValue:
            inventory.retailStockValue ?? 0,
          lowStock: inventory.lowStock ?? 0,
          outOfStock: inventory.outOfStock ?? 0,
          alerts: inventoryAlerts,
          alertsTruncated:
            (inventory.lowStock ?? 0) +
              (inventory.outOfStock ?? 0) >
            inventoryAlerts.length,
        },
      },
    });
  } catch (error) {
    console.error("Reports error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to generate reports",
    });
  }
};

module.exports = {
  getReports,
};
