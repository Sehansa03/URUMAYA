const Product = require("./product.model");

const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ==========================================
// PUBLIC: GET PRODUCTS
// ==========================================

const getProducts = async (req, res) => {
  try {
    const {
      category,
      search,
      sort = "newest",
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

    const filter = {
      isActive: true,
      approvalStatus: "published",
    };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.name = {
        $regex: escapeRegex(search),
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

    const sortBy =
      sortOptions[sort] || sortOptions.newest;

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

// ==========================================
// PUBLIC: GET PRODUCT BY SLUG
// ==========================================

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

// ==========================================
// STAFF / ADMIN: CREATE PRODUCT
// ==========================================

const createProduct = async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      approvalStatus: "pending",
      isActive: false,
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

// ==========================================
// STAFF / ADMIN: UPDATE PRODUCT
// ==========================================

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Archived products must be restored first.
    if (
      product.approvalStatus === "published" &&
      !product.isActive
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Restore this product before editing it",
      });
    }

    // Prevent changes to approval and stock fields.
    const {
      approvalStatus,
      createdBy,
      reviewedBy,
      isActive,
      stockQuantity,
      ...updates
    } = req.body;

    // Published or rejected products require
    // approval again after editing.
    if (
      product.approvalStatus === "published" ||
      product.approvalStatus === "rejected"
    ) {
      updates.approvalStatus = "pending";
      updates.isActive = false;
      updates.reviewedBy = null;
    }

    // Conditional update prevents an edit from
    // overwriting a concurrent archive or approval.
    const updatedProduct =
      await Product.findOneAndUpdate(
        {
          _id: product._id,
          approvalStatus: product.approvalStatus,
          isActive: product.isActive,
        },
        { $set: updates },
        {
          returnDocument: "after",
          runValidators: true,
        }
      );

    if (!updatedProduct) {
      return res.status(409).json({
        success: false,
        message:
          "Product status changed. Refresh and try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
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

// ==========================================
// ADMIN ONLY: ARCHIVE PRODUCT
// ==========================================

const deleteProduct = async (req, res) => {
  try {
    // Only active, published products can be archived.
    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        approvalStatus: "published",
        isActive: true,
      },
      {
        $set: { isActive: false },
      },
      {
        returnDocument: "after",
      }
    );

    if (!product) {
      const exists = await Product.exists({
        _id: req.params.id,
      });

      return res.status(exists ? 409 : 404).json({
        success: false,
        message: exists
          ? "Only active published products can be archived"
          : "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product archived successfully",
      data: product,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    console.error("Archive product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to archive product",
    });
  }
};

// ==========================================
// ADMIN ONLY: RESTORE PRODUCT
// ==========================================

const restoreProduct = async (req, res) => {
  try {
    // Only previously published, archived products
    // can be restored.
    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        approvalStatus: "published",
        isActive: false,
      },
      {
        $set: { isActive: true },
      },
      {
        returnDocument: "after",
      }
    );

    if (!product) {
      const exists = await Product.exists({
        _id: req.params.id,
      });

      return res.status(exists ? 409 : 404).json({
        success: false,
        message: exists
          ? "Only archived products can be restored"
          : "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product restored successfully",
      data: product,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    console.error("Restore product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to restore product",
    });
  }
};

// ==========================================
// ADMIN ONLY: APPROVE PRODUCT
// ==========================================

const approveProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        approvalStatus: "pending",
      },
      {
        $set: {
          approvalStatus: "published",
          isActive: true,
          reviewedBy: req.user._id,
        },
      },
      {
        returnDocument: "after",
      }
    );

    if (!product) {
      const exists = await Product.exists({
        _id: req.params.id,
      });

      return res.status(exists ? 400 : 404).json({
        success: false,
        message: exists
          ? "Only pending products can be approved"
          : "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Product approved and published successfully",
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

// ==========================================
// ADMIN ONLY: REJECT PRODUCT
// ==========================================

const rejectProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        approvalStatus: "pending",
      },
      {
        $set: {
          approvalStatus: "rejected",
          isActive: false,
          reviewedBy: req.user._id,
        },
      },
      {
        returnDocument: "after",
      }
    );

    if (!product) {
      const exists = await Product.exists({
        _id: req.params.id,
      });

      return res.status(exists ? 400 : 404).json({
        success: false,
        message: exists
          ? "Only pending products can be rejected"
          : "Product not found",
      });
    }

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

// ==========================================
// STAFF / ADMIN: GET MANAGED PRODUCTS
// ==========================================

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

    // Filter by product status.
    if (status) {
      const allowedStatuses = [
        "draft",
        "pending",
        "published",
        "rejected",
        "archived",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product status",
        });
      }

      if (status === "archived") {
        filter.approvalStatus = "published";
        filter.isActive = false;
      } else if (status === "published") {
        filter.approvalStatus = "published";
        filter.isActive = true;
      } else {
        filter.approvalStatus = status;
      }
    }

    // Filter by category.
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

    // Search by product name or SKU.
    if (search) {
      const safeSearch = escapeRegex(search);

      filter.$or = [
        {
          name: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          sku: {
            $regex: safeSearch,
            $options: "i",
          },
        },
      ];
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

// ==========================================
// STAFF / ADMIN: LOW STOCK COUNT
// ==========================================

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

    const count = await Product.countDocuments(
      filter
    );

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
};