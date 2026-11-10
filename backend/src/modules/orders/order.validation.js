
const { z } = require("zod");

// ==========================================
// SHIPPING ADDRESS VALIDATION
// ==========================================

const shippingAddressSchema = z.object({
  fullName: z.string().trim().min(2).max(120),

  phone: z
    .string()
    .trim()
    .regex(
      /^(?:\+94|0)7\d{8}$/,
      "Enter a valid Sri Lankan mobile number"
    ),

  addressLine1: z.string().trim().min(5).max(200),

  addressLine2: z.string().trim().max(200).optional(),

  city: z.string().trim().min(2).max(100),

  district: z.string().trim().min(2).max(100),

  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Enter a valid 5-digit postal code"),

  country: z.literal("Sri Lanka").default("Sri Lanka"),
});

// ==========================================
// ORDER ITEMS VALIDATION
// ==========================================

const orderItemSchema = z.object({
  productId: z.string().regex(
    /^[0-9a-fA-F]{24}$/,
    "Invalid product ID"
  ),

  quantity: z.number().int().min(1).max(100),
});

// ==========================================
// CREATE ORDER VALIDATION
// ==========================================

const createOrderSchema = z
  .object({
    items: z.array(orderItemSchema).min(1).max(30),

    shippingAddress: shippingAddressSchema,
  })
  .strict()
  .superRefine((data, ctx) => {
    const productIds = data.items.map(
      (item) => item.productId.toLowerCase()
    );

    if (new Set(productIds).size !== productIds.length) {
      ctx.addIssue({
        code: "custom",
        path: ["items"],
        message: "Duplicate products are not allowed",
      });
    }
  });

// ==========================================
// VALIDATION MIDDLEWARE
// ==========================================

const validateOrder = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid order information",
        details: result.error.flatten(),
      },
    });
  }

  req.body = result.data;
  next();
};

module.exports = {
  createOrderSchema,
  validateOrder,
};
