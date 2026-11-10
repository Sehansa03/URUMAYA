
const mongoose = require("mongoose");

// ==========================================
// ORDER ITEM SCHEMA
// ==========================================

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    sku: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

// ==========================================
// SHIPPING ADDRESS SCHEMA
// ==========================================

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },

    addressLine2: {
      type: String,
      trim: true,
      default: "",
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    district: {
      type: String,
      required: true,
      trim: true,
    },

    postalCode: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      default: "Sri Lanka",
      enum: ["Sri Lanka"],
    },
  },
  {
    _id: false,
  }
);

// ==========================================
// MAIN ORDER SCHEMA
// ==========================================

const orderSchema = new mongoose.Schema(
  {
    // Unique customer-facing order number
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Registered customer
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Products purchased
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "An order must contain at least one item.",
      },
    },

    // Delivery information
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    // Pricing
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      enum: ["LKR"],
      default: "LKR",
    },

    // ======================================
    // PAYMENT INFORMATION
    // ======================================

    paymentMethod: {
      type: String,
      enum: ["mock"],
      default: "mock",
    },

    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
        "refunded",
      ],
      default: "pending",
    },

    paidAt: {
      type: Date,
      default: null,
    },


    // Time limit for completing mock payment
    paymentExpiresAt: {
      type: Date,
      default: null,
    },

    // Tracks whether reserved inventory was released
    stockReleased: {
      type: Boolean,
      default: false,
    },


    // ======================================
    // ORDER FULFILLMENT
    // ======================================

    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    // Optional shipment information
    trackingNumber: {
      type: String,
      trim: true,
      default: "",
    },

    shippedAt: {
      type: Date,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    // Internal notes for management
    adminNotes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// DATABASE INDEXES
// ==========================================

// Customer order history
orderSchema.index({
  customer: 1,
  createdAt: -1,
});

// Management order filtering
orderSchema.index({
  orderStatus: 1,
  createdAt: -1,
});

// Payment monitoring
orderSchema.index({
  paymentStatus: 1,
  createdAt: -1,
});

// ==========================================
// EXPORT MODEL
// ==========================================

module.exports = mongoose.model("Order", orderSchema);
