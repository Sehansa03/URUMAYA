
const express = require("express");

const { protect } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/role.middleware");

const {
  createOrder,
  processMockPayment,
  getOrderById,
  getMyOrders,
  getAllOrders,
  getManagedOrderById,
  updateManagedOrderStatus,
} = require("./order.controller");

const {
  createOrderSchema,
  validateOrder,
} = require("./order.validation");

const {
  getManagementAnalytics,
} = require("./order.analytics.controller");

const router = express.Router();

// Customer: Create an order
router.post(
  "/",
  protect,
  authorize("customer"),
  validateOrder(createOrderSchema),
  createOrder
);

// Customer: Simulate payment
router.post(
  "/:id/mock-payment",
  protect,
  authorize("customer"),
  processMockPayment
);


// Customer: Retrieve their order history
router.get(
  "/my-orders",
  protect,
  authorize("customer"),
  getMyOrders
);


// Staff/Admin: Retrieve all customer orders
router.get(
  "/management/all",
  protect,
  authorize("staff", "admin"),
  getAllOrders
);

// Staff/Admin: Management dashboard analytics
router.get(
  "/management/analytics",
  protect,
  authorize("staff", "admin"),
  getManagementAnalytics
);

// Staff/Admin: Retrieve an individual customer order
router.get(
  "/management/:id",
  protect,
  authorize("staff", "admin"),
  getManagedOrderById
);


// Staff/Admin: Update order fulfillment status
router.patch(
  "/management/:id/status",
  protect,
  authorize("staff", "admin"),
  updateManagedOrderStatus
);

// Customer: Retrieve their own order
router.get(
  "/:id",
  protect,
  authorize("customer"),
  getOrderById
);


module.exports = router;
