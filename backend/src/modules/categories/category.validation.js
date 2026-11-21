
const { z } = require("zod");

// Fields allowed when creating or updating a category
const categoryFields = {
  name: z.string().trim().min(2).max(100),

  slug: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain lowercase letters, numbers and hyphens"
    ),

  description: z.string().trim().max(1000),

  coverImage: z.string().trim().max(500),

  isActive: z.boolean(),
};

// Admin: create a new craft category
const createCategorySchema = z
  .object({
    name: categoryFields.name,
    slug: categoryFields.slug,

    description: categoryFields.description.optional(),
    coverImage: categoryFields.coverImage.optional(),
    isActive: categoryFields.isActive.optional(),
  })
  .strict();

// Admin: update an existing category
const updateCategorySchema = z
  .object(categoryFields)
  .partial()
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    "Provide at least one field to update"
  );

// Validate incoming request data
const validateCategory = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid category information",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    req.body = result.data;
    next();
  };
};

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  validateCategory,
};
