const express = require("express");

const {
  protect,
} = require("../../middleware/auth.middleware");

const {
  authorize,
} = require("../../middleware/role.middleware");

const {
  getCustomerStatistics,
  getCustomers,
  getCustomerById,
} = require("./customer.controller");

const router = express.Router();

// All customer management endpoints require
// an authenticated admin or staff account.

router.use(protect);
router.use(authorize("admin", "staff"));

// Customer statistics
router.get("/statistics", getCustomerStatistics);

// Customer list
router.get("/", getCustomers);

// Individual customer details and order history
router.get("/:id", getCustomerById);

module.exports = router;