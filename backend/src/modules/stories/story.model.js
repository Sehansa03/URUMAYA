
const mongoose = require("mongoose");

const storySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    excerpt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 350,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 15000,
    },

    coverImage: {
      type: String,
      trim: true,
      default: "",
    },

    images: [
      {
        type: String,
        trim: true,
      },
    ],

    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
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

    relatedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    isFeatured: {
      type: Boolean,
      default: false,
    },

    approvalStatus: {
      type: String,
      enum: ["draft", "pending", "published", "rejected"],
      default: "draft",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

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

// Public story listing and category filtering
storySchema.index({
  approvalStatus: 1,
  category: 1,
  createdAt: -1,
});

// Featured stories
storySchema.index({
  approvalStatus: 1,
  isFeatured: 1,
});

module.exports = mongoose.model("Story", storySchema);
