const mongoose = require("mongoose");
const User = require("../auth/user.model");
const Order = require("../orders/order.model");

// ==========================================
// HELPERS
// ==========================================

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getPagination = (query) => {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 10);

  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    page > 100000 ||
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > 50
  ) {
    return null;
  }

  return { page, limit };
};

// ==========================================
// GET CUSTOMER STATISTICS
// ==========================================

const getCustomerStatistics = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";

    const [totalCustomers, activeCustomers, newCustomers] =
      await Promise.all([
        User.countDocuments({ role: "customer" }),

        User.countDocuments({
          role: "customer",
          isActive: true,
        }),

        User.countDocuments({
          role: "customer",
          createdAt: {
            $gte: new Date(
              Date.now() - 30 * 24 * 60 * 60 * 1000
            ),
          },
        }),
      ]);

    const statistics = {
      totalCustomers,
      activeCustomers,
      inactiveCustomers: totalCustomers - activeCustomers,
      newCustomers,
    };

    if (isAdmin) {
      const results = await Order.aggregate([
        {
          $match: {
            paymentStatus: "paid",
          },
        },
        {
          $group: {
            _id: "$customer",
            paidOrders: { $sum: 1 },
            totalSpent: { $sum: "$totalAmount" },
          },
        },
        {
          $lookup: {
            from: User.collection.name,
            localField: "_id",
            foreignField: "_id",
            as: "customer",
          },
        },
        {
          $match: {
            "customer.role": "customer",
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

            totalCustomerSpending: {
              $sum: "$totalSpent",
            },
          },
        },
      ]);

      statistics.purchasingCustomers =
        results[0]?.purchasingCustomers ?? 0;

      statistics.repeatCustomers =
        results[0]?.repeatCustomers ?? 0;

      statistics.totalCustomerSpending =
        results[0]?.totalCustomerSpending ?? 0;
    }

    return res.status(200).json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    console.error("Customer statistics error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve customer statistics",
    });
  }
};

// ==========================================
// GET ALL CUSTOMERS
// ==========================================

const getCustomers = async (req, res) => {
  try {
    const pagination = getPagination(req.query);

    if (!pagination) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
    }

    const { page, limit } = pagination;

    const search = req.query.search ?? "";
    const status = req.query.status ?? "";

    if (
      typeof search !== "string" ||
      search.length > 100 ||
      !["", "active", "inactive"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer filters",
      });
    }

    const filter = {
      role: "customer",
    };

    if (search.trim()) {
      const pattern = escapeRegex(search.trim());

      filter.$or = [
        {
          fullName: {
            $regex: pattern,
            $options: "i",
          },
        },
        {
          email: {
            $regex: pattern,
            $options: "i",
          },
        },
      ];
    }

    if (status === "active") {
      filter.isActive = true;
    }

    if (status === "inactive") {
      filter.isActive = false;
    }

    const [customers, totalCustomers] = await Promise.all([
      User.find(filter)
        .select("fullName email isActive createdAt")
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      User.countDocuments(filter),
    ]);

    const customerIds = customers.map(
      (customer) => customer._id
    );

    const isAdmin = req.user.role === "admin";

    const groupFields = {
      _id: "$customer",

      totalOrders: {
        $sum: 1,
      },

      lastOrderAt: {
        $max: "$createdAt",
      },
    };

    if (isAdmin) {
      groupFields.paidOrders = {
        $sum: {
          $cond: [
            { $eq: ["$paymentStatus", "paid"] },
            1,
            0,
          ],
        },
      };

      groupFields.totalSpent = {
        $sum: {
          $cond: [
            { $eq: ["$paymentStatus", "paid"] },
            "$totalAmount",
            0,
          ],
        },
      };
    }

    const orderStatistics = await Order.aggregate([
      {
        $match: {
          customer: { $in: customerIds },
        },
      },
      {
        $group: groupFields,
      },
    ]);

    const statisticsMap = new Map(
      orderStatistics.map((item) => [
        String(item._id),
        item,
      ])
    );

    const customerData = customers.map((customer) => {
      const stats = statisticsMap.get(
        String(customer._id)
      );

      return {
        ...customer,

        totalOrders: stats?.totalOrders ?? 0,
        lastOrderAt: stats?.lastOrderAt ?? null,

        ...(isAdmin && {
          paidOrders: stats?.paidOrders ?? 0,
          totalSpent: stats?.totalSpent ?? 0,
        }),
      };
    });

    return res.status(200).json({
      success: true,

      data: {
        customers: customerData,

        pagination: {
          page,
          limit,
          totalCustomers,
          totalPages: Math.ceil(totalCustomers / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get customers error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve customers",
    });
  }
};

// ==========================================
// GET INDIVIDUAL CUSTOMER DETAILS
// ==========================================

const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const pagination = getPagination(req.query);

    if (!pagination) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
    }

    const { page, limit } = pagination;

    const customer = await User.findOne({
      _id: id,
      role: "customer",
    })
      .select("fullName email phone isActive createdAt")
      .lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const isAdmin = req.user.role === "admin";

    const filter = {
      customer: customer._id,
    };

    const groupFields = {
      _id: null,

      totalOrders: { $sum: 1 },

      deliveredOrders: {
        $sum: {
          $cond: [
            { $eq: ["$orderStatus", "delivered"] },
            1,
            0,
          ],
        },
      },

      lastOrderAt: {
        $max: "$createdAt",
      },
    };

    if (isAdmin) {
      groupFields.paidOrders = {
        $sum: {
          $cond: [
            { $eq: ["$paymentStatus", "paid"] },
            1,
            0,
          ],
        },
      };

      groupFields.totalSpent = {
        $sum: {
          $cond: [
            { $eq: ["$paymentStatus", "paid"] },
            "$totalAmount",
            0,
          ],
        },
      };
    }

    const orderFields =
      "orderNumber orderStatus paymentStatus createdAt " +
      "items.name items.quantity" +
      (isAdmin ? " totalAmount currency" : "");

    const [orders, results] = await Promise.all([
      Order.find(filter)
        .select(orderFields)
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Order.aggregate([
        {
          $match: filter,
        },
        {
          $group: groupFields,
        },
      ]),
    ]);

    const stats = results[0] || {};

    const statistics = {
      totalOrders: stats.totalOrders ?? 0,
      deliveredOrders: stats.deliveredOrders ?? 0,
      lastOrderAt: stats.lastOrderAt ?? null,

      ...(isAdmin && {
        paidOrders: stats.paidOrders ?? 0,
        totalSpent: stats.totalSpent ?? 0,
      }),
    };

    return res.status(200).json({
      success: true,

      data: {
        customer,
        statistics,
        orders,

        pagination: {
          page,
          limit,
          totalOrders: statistics.totalOrders,
          totalPages: Math.ceil(
            statistics.totalOrders / limit
          ),
        },
      },
    });
  } catch (error) {
    console.error("Get customer details error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve customer details",
    });
  }
};

module.exports = {
  getCustomerStatistics,
  getCustomers,
  getCustomerById,
};