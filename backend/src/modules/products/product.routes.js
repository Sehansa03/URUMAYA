const express = require("express");

const {
  getProducts,
  getProductBySlug,
  getManagedProducts,
  getLowStockCount,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
  approveProduct,
  rejectProduct,
} = require("./product.controller");

const {
  protect,
} = require("../../middleware/auth.middleware");

const {
  authorize,
} = require("../../middleware/role.middleware");

const {
  createProductSchema,
  updateProductSchema,
  validateProduct,
} = require("./product.validation");

const {
  getInventory,
  adjustInventoryStock,
} = require("./inventory.controller");

const router = express.Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================

router.get("/", getProducts);

// ==========================================
// STAFF AND ADMIN MANAGEMENT ROUTES
// ==========================================

router.get(
  "/manage",
  protect,
  authorize("staff", "admin"),
  getManagedProducts
);

router.get(
  "/manage/low-stock-count",
  protect,
  authorize("staff", "admin"),
  getLowStockCount
);

router.get(
  "/manage/inventory",
  protect,
  authorize("staff", "admin"),
  getInventory
);

router.patch(
  "/manage/inventory/:id/adjust",
  protect,
  authorize("staff", "admin"),
  adjustInventoryStock
);

// Public product details.
router.get("/:slug", getProductBySlug);

// Submit a new product.
router.post(
  "/",
  protect,
  authorize("staff", "admin"),
  validateProduct(createProductSchema),
  createProduct
);

// Edit product information.
router.patch(
  "/:id",
  protect,
  authorize("staff", "admin"),
  validateProduct(updateProductSchema),
  updateProduct
);

// ==========================================
// ADMIN ONLY ROUTES
// ==========================================

// Approve product.
router.patch(
  "/:id/approve",
  protect,
  authorize("admin"),
  approveProduct
);

// Reject product.
router.patch(
  "/:id/reject",
  protect,
  authorize("admin"),
  rejectProduct
);

// Restore archived product.
router.patch(
  "/:id/restore",
  protect,
  authorize("admin"),
  restoreProduct
);

// Archive product.
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteProduct
);

module.exports = router;