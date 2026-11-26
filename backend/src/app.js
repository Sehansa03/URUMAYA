
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const authRoutes = require("./modules/auth/auth.routes");
const productRoutes = require("./modules/products/product.routes");
const productUploadRoutes = require("./modules/products/productUpload.routes");
const orderRoutes = require("./modules/orders/order.routes");
const storyRoutes = require("./modules/stories/story.routes");
const categoryRoutes = require("./modules/categories/category.routes");
const customerRoutes = require("./modules/customers/customer.routes");
const reportRoutes = require("./modules/reports/report.routes");
const cartRoutes = require("./modules/cart/cart.routes");
const staffRoutes = require("./modules/staff/staff.routes");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173",

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

// Authentication
app.use("/api/v1/auth", authRoutes);

// Products
app.use("/api/v1/products", productRoutes);

// Product image uploads
app.use(
  "/api/v1/products/uploads",
  productUploadRoutes
);

// Orders
app.use("/api/v1/orders", orderRoutes);

// Heritage stories
app.use("/api/v1/stories", storyRoutes);

// Shared craft categories
app.use("/api/v1/categories", categoryRoutes);

// Customer management
app.use("/api/v1/customers", customerRoutes);

// Reports and analytics
app.use("/api/v1/reports", reportRoutes);

// Customer shopping cart
app.use("/api/v1/cart", cartRoutes);

// Staff management
app.use("/api/v1/staff", staffRoutes);

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
