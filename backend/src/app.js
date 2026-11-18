
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const authRoutes = require("./modules/auth/auth.routes");

const productRoutes = require("./modules/products/product.routes");
const productUploadRoutes = require("./modules/products/productUpload.routes");
const orderRoutes = require("./modules/orders/order.routes");
const storyRoutes = require("./modules/stories/story.routes");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Health check
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "URUMAYA API is running",
    data: { status: "ok" },
  });
});

// Authentication routes
app.use("/api/v1/auth", authRoutes);

// Product routes
app.use("/api/v1/products", productRoutes);

// Product image uploads - Staff and Admin
app.use("/api/v1/products/uploads", productUploadRoutes);

// Customer order routes
app.use("/api/v1/orders", orderRoutes);

// Story routes
app.use("/api/v1/stories", storyRoutes);

// Not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "API route not found",
    },
  });
});

module.exports = app;
