
const express = require("express");

const { protect } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/role.middleware");

const {
  createOrder,
  processMockPayment,
  getOrderById,
} = require("./order.controller");

const {
  createOrderSchema,
  validateOrder,
} = require("./order.validation");

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


// Customer: Retrieve their own order
router.get(
  "/:id",
  protect,
  authorize("customer"),
  getOrderById
);


module.exports = router;
