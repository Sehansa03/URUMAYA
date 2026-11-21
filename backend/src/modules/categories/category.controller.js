
const Category = require("./category.model");

// ==========================================
// PUBLIC: GET ACTIVE CATEGORIES
// ==========================================

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({
      isActive: true,
    })
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN: GET ALL CATEGORIES
// ==========================================

const getManagedCategories = async (req, res, next) => {
  try {
    const categories = await Category.find()
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN: CREATE CATEGORY
// ==========================================

const createCategory = async (req, res, next) => {
  try {
    const existingCategory = await Category.findOne({
      slug: req.body.slug,
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "A category with this slug already exists",
      });
    }

    const category = await Category.create({
      ...req.body,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A category with this slug already exists",
      });
    }

    next(error);
  }
};

// ==========================================
// ADMIN: UPDATE CATEGORY
// ==========================================

const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Prevent changing the slug because products and
    // stories reference it using a string.
    if (
      req.body.slug !== undefined &&
      req.body.slug !== category.slug
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Category slug cannot be changed after creation",
      });
    }

    const { slug, ...updates } = req.body;

    Object.assign(category, updates);

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    next(error);
  }
};

module.exports = {
  getCategories,
  getManagedCategories,
  createCategory,
  updateCategory,
};
