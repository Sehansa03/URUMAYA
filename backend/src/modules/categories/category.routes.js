
const express = require("express");

const {
  getCategories,
  getManagedCategories,
  createCategory,
  updateCategory,
} = require("./category.controller");

const {
  protect,
} = require("../../middleware/auth.middleware");

const {
  authorize,
} = require("../../middleware/role.middleware");

const {
  createCategorySchema,
  updateCategorySchema,
  validateCategory,
} = require("./category.validation");

const router = express.Router();

// ============================================
// PUBLIC ROUTES
// ============================================

// Get active craft categories for Shop and Stories
router.get("/", getCategories);

// ============================================
// ADMIN ONLY ROUTES
// ============================================

// View all categories, including inactive ones
router.get(
  "/manage",
  protect,
  authorize("admin"),
  getManagedCategories
);

// Create a new craft category
router.post(
  "/",
  protect,
  authorize("admin"),
  validateCategory(createCategorySchema),
  createCategory
);

// Update category information or active status
router.patch(
  "/:id",
  protect,
  authorize("admin"),
  validateCategory(updateCategorySchema),
  updateCategory
);

module.exports = router;
