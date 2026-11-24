
const express = require("express");

const {
  protect,
} = require("../../middleware/auth.middleware");

const {
  authorize,
} = require("../../middleware/role.middleware");

const {
  getReports,
} = require("./report.controller");

const router = express.Router();

// Reports are restricted to administrators.
router.get(
  "/",
  protect,
  authorize("admin"),
  getReports
);

module.exports = router;
