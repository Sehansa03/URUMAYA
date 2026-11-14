
const mongoose = require("mongoose");

const Product = require("../products/product.model");
const Order = require("./order.model");

// Flat shipping fee for MVP
const SHIPPING_FEE = 500;

// Generate a unique order reference
const generateOrderNumber = () => {
  const randomPart = new mongoose.Types.ObjectId()
    .toString()
    .slice(-12)
    .toUpperCase();

  return `URU-${randomPart}`;
};

// ==========================================
// POST /api/v1/orders
// Customer: Create an order
// ==========================================

const createOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { items, shippingAddress } = req.body;

    let createdOrder;

    await session.withTransaction(async () => {
      const orderItems = [];
      let subtotal = 0;

      // Sort products for consistent processing
      const sortedItems = [...items].sort((a, b) =>
        a.productId.localeCompare(b.productId)
      );

      for (const item of sortedItems) {
        // Atomically reserve stock only if enough is available
        const product = await Product.findOneAndUpdate(
          {
            _id: item.productId,
            isActive: true,
            approvalStatus: "published",
            stockQuantity: { $gte: item.quantity },
          },
          {
            $inc: { stockQuantity: -item.quantity },
          },
          {
            returnDocument: "after",
            session,
          }
        );

        if (!product) {
          const error = new Error(
            "A selected product is unavailable or has insufficient stock"
          );
          error.statusCode = 409;
          throw error;
        }

        const unitPrice = product.price;
        const totalPrice = unitPrice * item.quantity;

        orderItems.push({
          product: product._id,
          name: product.name,
          sku: product.sku,
          image: product.images?.[0] || "",
          quantity: item.quantity,
          unitPrice,
          totalPrice,
        });

        subtotal += totalPrice;
      }

      const totalAmount = subtotal + SHIPPING_FEE;

      const orders = await Order.create(
        [
          {
            orderNumber: generateOrderNumber(),
            customer: req.user._id,
            items: orderItems,
            shippingAddress,
            subtotal,
            shippingFee: SHIPPING_FEE,
            totalAmount,
            currency: "LKR",
            paymentMethod: "mock",
            paymentStatus: "pending",
            orderStatus: "pending",

            // Payment must be completed within 15 minutes
            paymentExpiresAt: new Date(Date.now() + 15 * 60 * 1000),

            // Reserved stock has not been released
            stockReleased: false,

          },
        ],
        { session }
      );

      createdOrder = orders[0];
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully. Payment is pending.",
      data: createdOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);

    if (error.statusCode === 409) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Order reference conflict. Please try again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  } finally {
    await session.endSession();
  }
};


/**
 * POST /api/v1/orders/:id/mock-payment
 * Customer: Simulate a successful or failed payment
 */
const processMockPayment = async (req, res) => {
  const { result } = req.body;

  if (!["success", "failure"].includes(result)) {
    return res.status(400).json({
      success: false,
      message: "Payment result must be success or failure",
    });
  }

  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order ID",
    });
  }

  const session = await mongoose.startSession();

  try {
    let updatedOrder;

    await session.withTransaction(async () => {
      const order = await Order.findOne({
        _id: req.params.id,
        customer: req.user._id,
      }).session(session);

      if (!order) {
        const error = new Error("Order not found");
        error.statusCode = 404;
        throw error;
      }

      if (
        order.paymentStatus !== "pending" ||
        order.orderStatus !== "pending"
      ) {
        const error = new Error(
          "This order is no longer awaiting payment"
        );
        error.statusCode = 409;
        throw error;
      }

      const isExpired =
        !order.paymentExpiresAt ||
        order.paymentExpiresAt.getTime() <= Date.now();

      if (isExpired) {
        order.paymentStatus = "failed";
        order.orderStatus = "cancelled";
        order.cancelledAt = new Date();
      } else if (result === "success") {
        order.paymentStatus = "paid";
        order.orderStatus = "confirmed";
        order.paidAt = new Date();
      } else {
        order.paymentStatus = "failed";
        order.orderStatus = "cancelled";
        order.cancelledAt = new Date();
      }

      // Restore reserved inventory for failed or expired payments.
      if (order.paymentStatus === "failed" && !order.stockReleased) {
        for (const item of order.items) {
          await Product.updateOne(
            { _id: item.product },
            { $inc: { stockQuantity: item.quantity } },
            { session }
          );
        }

        order.stockReleased = true;
      }

      await order.save({ session });

      updatedOrder = order;
    });

    return res.status(200).json({
      success: true,
      message:
        updatedOrder.paymentStatus === "paid"
          ? "Mock payment completed successfully"
          : "Payment failed or expired. Reserved stock restored.",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Mock payment error:", error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to process mock payment",
    });
  } finally {
    await session.endSession();
  }
};


/**
 * GET /api/v1/orders/:id
 * Customer: Retrieve their own order
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // Only retrieve orders belonging to this customer
    const order = await Order.findOne({
      _id: id,
      customer: req.user._id,
    }).select(
      "-shippingAddress -adminNotes -__v"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      data: order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve order",
    });
  }
};


/**
 * GET /api/v1/orders/my-orders
 * Customer: Retrieve their own order history
 */
const getMyOrders = async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);

    // Validate pagination parameters
    if (
      !Number.isSafeInteger(page) ||
      page < 1 ||
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      limit > 50
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
    }

    const filter = {
      customer: req.user._id,
    };

    const [orders, totalOrders] = await Promise.all([
      Order.find(filter)
        .select("-shippingAddress -adminNotes -__v")
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Order.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Order history retrieved successfully",
      data: {
        orders,
        pagination: {
          page,
          limit,
          totalOrders,
          totalPages: Math.ceil(totalOrders / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get my orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve order history",
    });
  }
};


/**
 * GET /api/v1/orders/management/all
 * Staff/Admin: Retrieve all customer orders
 */
const getAllOrders = async (req, res) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);

    if (
      !Number.isSafeInteger(page) ||
      page < 1 ||
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      limit > 50
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
    }

    const filter = {};

    // Optional order status filter
    if (req.query.orderStatus !== undefined) {
      const allowedStatuses = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];

      if (!allowedStatuses.includes(req.query.orderStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status",
        });
      }

      filter.orderStatus = req.query.orderStatus;
    }

    // Optional payment status filter
    if (req.query.paymentStatus !== undefined) {
      const allowedPaymentStatuses = [
        "pending",
        "paid",
        "failed",
        "refunded",
      ];

      if (
        !allowedPaymentStatuses.includes(req.query.paymentStatus)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment status",
        });
      }

      filter.paymentStatus = req.query.paymentStatus;
    }

    const [orders, totalOrders] = await Promise.all([
      Order.find(filter)
        .select("-adminNotes -__v")
        .populate("customer", "fullName email")
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Order.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: {
        orders,
        pagination: {
          page,
          limit,
          totalOrders,
          totalPages: Math.ceil(totalOrders / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get all orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve orders",
    });
  }
};


/**
 * GET /api/v1/orders/management/:id
 * Staff/Admin: Retrieve a single customer order
 */
const getManagedOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // Staff and admins can view customer orders
    const order = await Order.findById(id)
      .select("-adminNotes -__v")
      .populate("customer", "fullName email")
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Management order details retrieved successfully",
      data: order,
    });
  } catch (error) {
    console.error("Get managed order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve order details",
    });
  }
};


/**
 * PATCH /api/v1/orders/management/:id/status
 * Staff/Admin: Advance an order through fulfillment
 */
const updateManagedOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber } = req.body || {};

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const nextStatus = {
      confirmed: "processing",
      processing: "shipped",
      shipped: "delivered",
    };

    if (!["processing", "shipped", "delivered"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid fulfillment status",
      });
    }

    if (
      trackingNumber !== undefined &&
      typeof trackingNumber !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Tracking number must be a string",
      });
    }

    const tracking = trackingNumber?.trim();

    if (status === "shipped" && (!tracking || tracking.length > 100)) {
      return res.status(400).json({
        success: false,
        message: "A tracking number of 1–100 characters is required",
      });
    }

    const now = new Date();

    // Atomic conditional update prevents two requests from
    // advancing the same order from an outdated status.
    const filter = {
      _id: id,
      paymentStatus: "paid",
      orderStatus: Object.keys(nextStatus).find(
        (current) => nextStatus[current] === status
      ),
    };

    const changes = {
      orderStatus: status,
    };

    if (status === "shipped") {
      changes.trackingNumber = tracking;
      changes.shippedAt = now;
    }

    if (status === "delivered") {
      changes.deliveredAt = now;
    }

    const order = await Order.findOneAndUpdate(
      filter,
      { $set: changes },
      { returnDocument: "after", runValidators: true }
    )
      .select("-adminNotes -__v")
      .populate("customer", "fullName email");

    if (!order) {
      const existingOrder = await Order.findById(id)
        .select("orderStatus paymentStatus")
        .lean();

      if (!existingOrder) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      return res.status(409).json({
        success: false,
        message:
          "Order cannot be updated. Check its payment status and current fulfillment stage.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order,
    });
  } catch (error) {
    console.error("Update managed order status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};
module.exports = {
  createOrder,
  processMockPayment,
  getOrderById,
  getMyOrders,
  getAllOrders,
  getManagedOrderById,
  updateManagedOrderStatus,
};
