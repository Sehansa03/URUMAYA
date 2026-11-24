
const { z } = require("zod");

const Category = require("../categories/category.model");


const productFields = {
  name: z.string().trim().min(2).max(150),

  slug: z
    .string()
    .trim()
    .min(2)
    .max(160)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain lowercase letters, numbers and hyphens"
    ),

  description: z.string().trim().min(10).max(3000),

  category: z
  .string()
  .trim()
  .min(2)
  .max(100)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Invalid category slug"
  ),

  price: z.number().finite().nonnegative(),

  currency: z.literal("LKR"),

  images: z
    .array(z.string().trim().min(1).max(500))
    .max(10),

  sku: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(
      /^[A-Za-z0-9_-]+$/,
      "Invalid SKU format"
    )
    .transform((value) => value.toUpperCase()),

  stockQuantity: z.number().int().nonnegative(),

  lowStockThreshold: z.number().int().nonnegative(),

  artisanName: z.string().trim().max(150),

  originDistrict: z.string().trim().max(100),

  heritageStory: z.string().trim().max(3000),

  isFeatured: z.boolean(),
};

// Staff and admins can submit normal product information.
// Approval fields are intentionally excluded.
const createProductSchema = z
  .object({
    ...productFields,

    currency: productFields.currency.optional(),
    images: productFields.images.optional(),
    stockQuantity: productFields.stockQuantity.optional(),
    lowStockThreshold:
      productFields.lowStockThreshold.optional(),
    artisanName: productFields.artisanName.optional(),
    originDistrict: productFields.originDistrict.optional(),
    heritageStory: productFields.heritageStory.optional(),
    isFeatured: productFields.isFeatured.optional(),
  })
  .strict();

// Only editable product fields are allowed.
// approvalStatus, isActive, createdBy, and reviewedBy
// cannot be updated through this schema.
const updateProductSchema = z
  .object(productFields)
  .omit({
    stockQuantity: true,
  })
  .partial()
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    "Provide at least one field to update"
  );


const validateProduct = (schema) => {
  return async (req, res, next) => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: "Invalid product information",
          errors: result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
      }

      // Check the category only when it is supplied.
      // This allows updates to other product fields.
      if (result.data.category !== undefined) {
        const category = await Category.findOne({
          slug: result.data.category,
          isActive: true,
        }).lean();

        if (!category) {
          return res.status(400).json({
            success: false,
            message: "Invalid product category",
            errors: [
              {
                field: "category",
                message:
                  "Please select an existing active craft category",
              },
            ],
          });
        }
      }

      req.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};


module.exports = {
  createProductSchema,
  updateProductSchema,
  validateProduct,
};
