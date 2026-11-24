const express = require("express");

const {
  getProducts,
  getProductBySlug,
  getManagedProducts,
  getLowStockCount,
  createProduct,
  updateProduct,
  deleteProduct,
  approveProduct,
  rejectProduct,
} = require("./product.controller");

const { protect } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/role.middleware");

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

// ============================================
// PUBLIC ROUTES
// ============================================

// Browse products
router.get("/", getProducts);


// Staff and Admin: View products for management
router.get(
  "/manage",
  protect,
  authorize("staff", "admin"),
  getManagedProducts
);

// Stock alerts: must appear before /:slug
router.get("/manage/low-stock-count", protect, authorize("staff", "admin"), getLowStockCount);


// Staff/Admin: View inventory and stock statistics
router.get(
  "/manage/inventory",
  protect,
  authorize("staff", "admin"),
  getInventory
);

// Staff/Admin: Adjust stock without resetting approval
router.patch(
  "/manage/inventory/:id/adjust",
  protect,
  authorize("staff", "admin"),
  adjustInventoryStock
);


// View a product by slug
router.get("/:slug", getProductBySlug);

// ============================================
// STAFF + ADMIN ROUTES
// ============================================

// Submit a new product for approval
router.post(
  "/",
  protect,
  authorize("staff", "admin"),
  validateProduct(createProductSchema),
  createProduct
);

// Edit product information
router.patch(
  "/:id",
  protect,
  authorize("staff", "admin"),
  validateProduct(updateProductSchema),
  updateProduct
);

// ============================================
// ADMIN-ONLY ROUTES
// ============================================

// Approve a pending product
router.patch(
  "/:id/approve",
  protect,
  authorize("admin"),
  approveProduct
);

// Reject a pending product
router.patch(
  "/:id/reject",
  protect,
  authorize("admin"),
  rejectProduct
);

// Archive a product
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteProduct
);

module.exports = router;
