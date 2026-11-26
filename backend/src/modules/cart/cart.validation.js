const { z } = require("zod");

// MongoDB ObjectId validation
const productIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "Invalid product ID");

// Quantity validation
const quantitySchema = z
  .number()
  .int("Quantity must be an integer")
  .min(1, "Quantity must be at least 1")
  .max(Number.MAX_SAFE_INTEGER, "Quantity is too large");

// Add product to cart
const addToCartSchema = z.object({
  productId: productIdSchema,
  quantity: quantitySchema,
}).strict();

// Update cart item quantity
const updateCartItemSchema = z.object({
  quantity: quantitySchema,
}).strict();

// Validate product ID from URL parameters
const cartProductParamsSchema = z.object({
  productId: productIdSchema,
});

// Reusable validation middleware
const validateCart = (schema, source = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Cart validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    req.validatedCart = result.data;

    next();
  };
};

module.exports = {
  addToCartSchema,
  updateCartItemSchema,
  cartProductParamsSchema,
  validateCart,
};