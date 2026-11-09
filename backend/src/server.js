
require("dotenv").config();

const dns = require("node:dns");
const app = require("./app");
const connectDB = require("./config/db");

// Use Google DNS for MongoDB Atlas SRV resolution
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`URUMAYA API running on http://localhost:${PORT}`);
  });
};

startServer();
