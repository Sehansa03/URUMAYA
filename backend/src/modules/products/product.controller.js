const Product = require("./product.model");

// GET /api/v1/products
// Public: Browse active products
const getProducts = async (req, res) => {
  try {
    const {
      category,
      search,
      sort = "newest",
      page = 1,
      limit = 12,
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.min(
      50,
      Math.max(1, parseInt(limit, 10) || 12)
    );

    
     const filter = {
         isActive: true,
         approvalStatus: "published",
     };


    if (category) {
      filter.category = category;
    }

    if (search) {
      const safeSearch = String(search).replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.name = {
        $regex: safeSearch,
        $options: "i",
      };
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      name_asc: { name: 1 },
    };

    const sortBy = sortOptions[sort] || sortOptions.newest;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortBy)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve products",
    });
  }
};

// GET /api/v1/products/:slug
// Public: View product details
const getProductBySlug = async (req, res) => {
  try {
    
     const product = await Product.findOne({
        slug: req.params.slug,
        isActive: true,
        approvalStatus: "published",
     }).lean();


    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve product",
    });
  }
};

// POST /api/v1/products
// Admin: Create a product

const createProduct = async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,

      // New products always require approval
      approvalStatus: "pending",

      // New products are hidden until approved
      isActive: false,

      // Record who submitted the product
      createdBy: req.user._id,

      reviewedBy: null,
    });

    return res.status(201).json({
      success: true,
      message: "Product submitted for admin approval",
      data: product,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Product SKU or slug already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit product",
    });
  }
};


// PATCH /api/v1/products/:id
// Admin: Update product details

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Never allow approval fields through product editing
    const {
      approvalStatus,
      createdBy,
      reviewedBy,
      isActive,
      ...updates
    } = req.body;

    

    // Apply validated product fields
    Object.assign(product, updates);

    // Any change to a published product requires reapproval.
    // Hide it until the admin reviews the changes.
    if (product.approvalStatus === "published") {
      product.approvalStatus = "pending";
      product.isActive = false;
      product.reviewedBy = null;
    }

    // Rejected products can be resubmitted after editing.
    if (product.approvalStatus === "rejected") {
      product.approvalStatus = "pending";
      product.isActive = false;
      product.reviewedBy = null;
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Product SKU or slug already exists",
      });
    }

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product data or ID",
      });
    }

    console.error("Update product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};


// DELETE /api/v1/products/:id
// Admin: Soft delete (hide without removing history)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { returnDocument: "after" }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product archived successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    console.error("Delete product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to archive product",
    });
  }
};


/**
 * PATCH /api/v1/products/:id/approve
 * Admin only: Approve a pending product
 */
const approveProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.approvalStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending products can be approved",
      });
    }

    product.approvalStatus = "published";
    product.isActive = true;
    product.reviewedBy = req.user._id;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product approved and published successfully",
      data: product,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    console.error("Approve product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to approve product",
    });
  }
};

/**
 * PATCH /api/v1/products/:id/reject
 * Admin only: Reject a pending product
 */
const rejectProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.approvalStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending products can be rejected",
      });
    }

    product.approvalStatus = "rejected";
    product.isActive = false;
    product.reviewedBy = req.user._id;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product rejected successfully",
      data: product,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    console.error("Reject product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reject product",
    });
  }
};


/**
 * GET /api/v1/products/manage
 * Staff: View their own submitted products
 * Admin: View all products
 */
const getManagedProducts = async (req, res) => {
  try {
    const {
      status,
      category,
      search,
      page = 1,
      limit = 12,
    } = req.query;

    const pageNumber = Math.max(
      1,
      parseInt(page, 10) || 1
    );

    const limitNumber = Math.min(
      50,
      Math.max(1, parseInt(limit, 10) || 12)
    );

    const filter = {};

    

    // Filter by approval status
    if (status) {
      const allowedStatuses = [
        "draft",
        "pending",
        "published",
        "rejected",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid approval status",
        });
      }

      filter.approvalStatus = status;
    }

    
    // Filter by category using its slug.
    // Categories are managed dynamically in MongoDB.
    if (category) {
      if (
        typeof category !== "string" ||
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(category)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product category",
        });
      }

      filter.category = category;
    }


    // Search by product name
    if (search) {
      const safeSearch = String(search).replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.name = {
        $regex: safeSearch,
        $options: "i",
      };
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .populate("createdBy", "fullName email role")
        .populate("reviewedBy", "fullName email")
        .lean(),

      Product.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("Get managed products error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve managed products",
    });
  }
};



// Shared low-stock count for admin and staff.
const getLowStockCount = async (req, res) => {
  try {
    const filter = {
      isActive: true,
      approvalStatus: "published",
      $expr: {
        $lte: [
          "$stockQuantity",
          "$lowStockThreshold",
        ],
      },
    };

    const count = await Product.countDocuments(filter);

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Get low stock count error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve low stock count",
    });
  }
};

module.exports = {
  getLowStockCount,
  getProducts,
  getProductBySlug,
  getManagedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  approveProduct,
  rejectProduct,
};
