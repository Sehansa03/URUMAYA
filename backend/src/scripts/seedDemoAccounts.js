require("dotenv").config();

const mongoose = require("mongoose");
const crypto = require("node:crypto");
const dns = require("node:dns");

const connectDB = require("../config/db");
const User = require("../modules/auth/user.model");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const demoAccounts = [
  {
    fullName: "Demo Customer",
    email: "customer@urumaya.example",
    role: "customer",
  },
  {
    fullName: "Demo Administrator",
    email: "demo.admin@urumaya.example",
    role: "admin",
  },
  {
    fullName: "Demo Staff",
    email: "demo.staff@urumaya.example",
    role: "staff",
  },
];

const seedDemoAccounts = async () => {
  try {
    await connectDB();

    for (const account of demoAccounts) {
      const existingUser = await User.findOne({
        email: account.email,
      });

      if (existingUser) {
        console.log(`Already exists: ${account.email}`);
        continue;
      }

      await User.create({
        ...account,
        password: crypto.randomBytes(32).toString("hex"),
        isActive: true,
      });

      console.log(`Created: ${account.email}`);
    }

    console.log("\nDemo account setup completed.");
  } catch (error) {
    console.error("Demo setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedDemoAccounts();