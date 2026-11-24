
const mongoose = require("mongoose");
const Product = require("./product.model");

// Shared inventory for admin and staff.
// Only published, active products appear in Inventory.
const inventoryScope = () => ({
  isActive: true,
  approvalStatus: "published",
});

// GET /api/v1/products/manage/inventory
const getInventory = async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const search = String(req.query.search || "").trim();
    const status = String(req.query.status || "all");

    if (
      !Number.isSafeInteger(page) ||
      page < 1 ||
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      limit > 50
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
    }

    if (
      !["all", "in-stock", "low-stock", "out-of-stock"].includes(
        status
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid stock status",
      });
    }

    if (search.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Search text is too long",
      });
    }

    const scope = inventoryScope();
    const filter = { ...scope };

    if (search) {
      const safeSearch = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { sku: { $regex: safeSearch, $options: "i" } },
      ];
    }

    if (status === "out-of-stock") {
      filter.stockQuantity = 0;
    } else if (status === "low-stock") {
      filter.stockQuantity = { $gt: 0 };
      filter.$expr = {
        $lte: ["$stockQuantity", "$lowStockThreshold"],
      };
    } else if (status === "in-stock") {
      filter.$expr = {
        $gt: ["$stockQuantity", "$lowStockThreshold"],
      };
    }

    const [
      products,
      total,
      totalProducts,
      lowStock,
      outOfStock,
      stockTotals,
    ] = await Promise.all([
      Product.find(filter)
        .select(
          "name sku images category price stockQuantity lowStockThreshold"
        )
        .sort({ name: 1, _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Product.countDocuments(filter),

      Product.countDocuments(scope),

      Product.countDocuments({
        ...scope,
        stockQuantity: { $gt: 0 },
        $expr: {
          $lte: ["$stockQuantity", "$lowStockThreshold"],
        },
      }),

      Product.countDocuments({
        ...scope,
        stockQuantity: 0,
      }),

      Product.aggregate([
        { $match: scope },
        {
          $group: {
            _id: null,
            totalUnits: { $sum: "$stockQuantity" },
          },
        },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        products,
        summary: {
          totalProducts,
          totalUnits: stockTotals[0]?.totalUnits ?? 0,
          lowStock,
          outOfStock,
        },
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get inventory error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load inventory",
    });
  }
};

// PATCH /api/v1/products/manage/inventory/:id/adjust
const adjustInventoryStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { adjustment } = req.body || {};

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Positive numbers add stock.
    // Negative numbers remove stock.
    if (
      typeof adjustment !== "number" ||
      !Number.isSafeInteger(adjustment) ||
      adjustment === 0 ||
      Math.abs(adjustment) > 100000
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Adjustment must be a non-zero whole number between -100000 and 100000",
      });
    }

    const filter = {
      _id: id,
      ...inventoryScope(),
    };

    // Atomic condition prevents removing more stock
    // than the product currently has.
    if (adjustment < 0) {
      filter.stockQuantity = {
        $gte: Math.abs(adjustment),
      };
    }

    const product = await Product.findOneAndUpdate(
      filter,
      {
        $inc: {
          stockQuantity: adjustment,
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    ).select(
      "name sku stockQuantity lowStockThreshold approvalStatus isActive"
    );

    if (!product) {
      return res.status(409).json({
        success: false,
        message:
          "Stock adjustment could not be completed. Check the available quantity and your permissions.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Adjust inventory error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid stock adjustment",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update stock",
    });
  }
};

module.exports = {
  getInventory,
  adjustInventoryStock,
};
