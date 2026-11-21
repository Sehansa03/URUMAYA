
const express = require("express");

const {
  getCategories,
  getManagedCategories,
  createCategory,
  updateCategory,
} = require("./category.controller");

const {
  uploadCategoryImage,
} = require("./category.upload.controller");

const {
  protect,
} = require("../../middleware/auth.middleware");

const {
  authorize,
} = require("../../middleware/role.middleware");

const upload = require("../../middleware/upload.middleware");

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

// Upload one category cover image to Cloudinary
router.post(
  "/uploads",
  protect,
  authorize("admin"),
  upload.single("image"),
  uploadCategoryImage
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
