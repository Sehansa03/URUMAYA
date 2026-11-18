
const { z } = require("zod");

const categories = [
  "pottery",
  "textiles",
  "masks",
  "brassware",
];

const storyFields = {
  title: z.string().trim().min(3).max(180),

  slug: z
    .string()
    .trim()
    .min(2)
    .max(180)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain lowercase letters, numbers and hyphens"
    ),

  excerpt: z.string().trim().min(10).max(350),

  content: z.string().trim().min(20).max(15000),

  coverImage: z.string().trim().max(500),

  images: z
    .array(z.string().trim().min(1).max(500))
    .max(10),

  category: z.enum(categories),

  artisanName: z.string().trim().max(150),

  originDistrict: z.string().trim().max(100),

  relatedProducts: z
    .array(
      z.string().regex(
        /^[a-fA-F0-9]{24}$/,
        "Invalid product ID"
      )
    )
    .max(30),

  isFeatured: z.boolean(),
};

// Story starts as a draft.
// Approval fields are intentionally excluded.
const createStorySchema = z
  .object({
    title: storyFields.title,
    slug: storyFields.slug,
    excerpt: storyFields.excerpt,
    content: storyFields.content,
    category: storyFields.category,

    coverImage: storyFields.coverImage.optional(),
    images: storyFields.images.optional(),
    artisanName: storyFields.artisanName.optional(),
    originDistrict: storyFields.originDistrict.optional(),
    relatedProducts: storyFields.relatedProducts.optional(),
    isFeatured: storyFields.isFeatured.optional(),
  })
  .strict();

// Staff can edit story content, but not approval
// status, ownership or review information.
const updateStorySchema = z
  .object(storyFields)
  .partial()
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    "Provide at least one field to update"
  );

const validateStory = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid story information",
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
  createStorySchema,
  updateStorySchema,
  validateStory,
};
