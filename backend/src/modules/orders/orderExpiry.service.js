
const mongoose = require("mongoose");

const Order = require("./order.model");
const Product = require("../products/product.model");

// ==========================================
// EXPIRE ONE UNPAID ORDER
// ==========================================

const expireOrder = async (orderId) => {
  const session = await mongoose.startSession();

  try {
    let expired = false;

    await session.withTransaction(async () => {
      const now = new Date();

      const order = await Order.findOne({
        _id: orderId,
        paymentStatus: "pending",
        orderStatus: "pending",
        stockReleased: false,
        paymentExpiresAt: { $lte: now },
      }).session(session);

      // Another process may have already completed payment
      // or released the inventory.
      if (!order) return;

      for (const item of order.items) {
        const result = await Product.updateOne(
          { _id: item.product },
          { $inc: { stockQuantity: item.quantity } },
          { session }
        );

        if (result.matchedCount !== 1) {
          throw new Error(
            `Unable to restore stock for product ${item.product}`
          );
        }
      }

      order.paymentStatus = "failed";
      order.orderStatus = "cancelled";
      order.stockReleased = true;
      order.cancelledAt = now;

      await order.save({ session });

      expired = true;
    });

    return expired;
  } finally {
    await session.endSession();
  }
};

// ==========================================
// FIND AND EXPIRE UNPAID ORDERS
// ==========================================

const cleanupExpiredOrders = async () => {
  const now = new Date();

  const expiredOrders = await Order.find({
    paymentStatus: "pending",
    orderStatus: "pending",
    stockReleased: false,
    paymentExpiresAt: { $lte: now },
  })
    .select("_id")
    .limit(100)
    .lean();

  let cleaned = 0;

  for (const order of expiredOrders) {
    try {
      const expired = await expireOrder(order._id);

      if (expired) cleaned++;
    } catch (error) {
      console.error(
        `Failed to expire order ${order._id}:`,
        error.message
      );
    }
  }

  return cleaned;
};

// ==========================================
// START AUTOMATIC CLEANUP
// ==========================================

const startOrderExpiryJob = () => {
  const INTERVAL_MS = 60 * 1000;

  let running = false;

  const runCleanup = async () => {
    if (running) return;

    running = true;

    try {
      const cleaned = await cleanupExpiredOrders();

      if (cleaned > 0) {
        console.log(
          `Expired ${cleaned} unpaid order(s) and restored stock`
        );
      }
    } catch (error) {
      console.error(
        "Order expiry cleanup failed:",
        error.message
      );
    } finally {
      running = false;
    }
  };

  // Check shortly after startup
  runCleanup();

  // Then check every minute
  const timer = setInterval(runCleanup, INTERVAL_MS);

  return () => clearInterval(timer);
};

module.exports = {
  expireOrder,
  cleanupExpiredOrders,
  startOrderExpiryJob,
};
