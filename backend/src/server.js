
require("dotenv").config();

const dns = require("node:dns");

const app = require("./app");
const connectDB = require("./config/db");

const {
  startOrderExpiryJob,
} = require("./modules/orders/orderExpiry.service");

// Use Google DNS for MongoDB Atlas SRV resolution
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Step 1: Connect to MongoDB
  await connectDB();

  // Step 2: Start automatic order expiry cleanup
  startOrderExpiryJob();

  // Step 3: Start Express server
  app.listen(PORT, () => {
    console.log(`URUMAYA API running on http://localhost:${PORT}`);
  });
};

startServer();
