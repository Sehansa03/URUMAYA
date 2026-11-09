
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "pottery",
        "textiles",
        "masks",
        "brassware",
      ],
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "LKR",
      enum: ["LKR"],
    },

    images: [
      {
        type: String,
        trim: true,
      },
    ],

    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    lowStockThreshold: {
      type: Number,
      default: 5,
      min: 0,
    },

    artisanName: {
      type: String,
      trim: true,
      default: "",
    },

    originDistrict: {
      type: String,
      trim: true,
      default: "",
    },

    heritageStory: {
      type: String,
      trim: true,
      default: "",
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    
    // Product approval workflow
    approvalStatus: {
      type: String,
      enum: ["draft", "pending", "published", "rejected"],
      default: "pending",
      required: true,
    },

    // Staff or admin who created the product
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Admin review information
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    
  },
  {
    timestamps: true,
  }
);

// Useful for shop filtering
productSchema.index({
  category: 1,
  isActive: 1,
});

// Useful for featured collections
productSchema.index({
  isFeatured: 1,
  isActive: 1,
});

// Useful for sorting by price
productSchema.index({
  price: 1,
});

module.exports = mongoose.model("Product", productSchema);
