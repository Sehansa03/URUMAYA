const mongoose = require("mongoose");

// ==========================================
// CART ITEM SCHEMA
// ==========================================

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isSafeInteger,
        message: "Quantity must be a positive integer",
      },
    },
  },
  {
    _id: false,
  }
);

// ==========================================
// CART SCHEMA
// ==========================================

const cartSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  }
);

// ==========================================
// CART MODEL
// ==========================================

module.exports = mongoose.model("Cart", cartSchema);