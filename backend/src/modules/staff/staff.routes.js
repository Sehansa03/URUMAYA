const express = require("express");

const {
  protect,
} = require("../../middleware/auth.middleware");

const {
  authorize,
} = require("../../middleware/role.middleware");

const {
  getStaff,
  createStaff,
  updateStaff,
  updateStaffStatus,
  resetStaffPassword,
} = require("./staff.controller");

const router = express.Router();

// All staff management endpoints are admin-only
router.use(protect);
router.use(authorize("admin"));

// Get staff list and statistics
router.get("/", getStaff);

// Create a staff account
router.post("/", createStaff);

// Update staff details
router.patch("/:id", updateStaff);

// Activate or deactivate a staff account
router.patch("/:id/status", updateStaffStatus);

// Reset staff password
router.patch("/:id/password", resetStaffPassword);

module.exports = router;