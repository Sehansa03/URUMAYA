const express = require("express");

const { protect } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/role.middleware");

const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("./cart.controller");

const {
  addToCartSchema,
  updateCartItemSchema,
  cartProductParamsSchema,
  validateCart,
} = require("./cart.validation");

const router = express.Router();

// ==========================================
// AUTHENTICATION AND AUTHORIZATION
// ==========================================

router.use(protect);
router.use(authorize("customer"));

// ==========================================
// CART ROUTES
// ==========================================

// Retrieve customer's cart
router.get("/", getCart);

// Add product to cart
router.post(
  "/items",
  validateCart(addToCartSchema),
  addToCart
);

// Update cart item quantity
router.patch(
  "/items/:productId",
  validateCart(cartProductParamsSchema, "params"),
  validateCart(updateCartItemSchema),
  updateCartItem
);

// Remove product from cart
router.delete(
  "/items/:productId",
  validateCart(cartProductParamsSchema, "params"),
  removeCartItem
);

// Clear customer's cart
router.delete("/", clearCart);

module.exports = router;