
require("dotenv").config();

const dns = require("node:dns");
const mongoose = require("mongoose");

const connectDB = require("../config/db");
const Category = require("../modules/categories/category.model");

// Match the DNS configuration in server.js
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const initialCategories = [
  {
    name: "Pottery",
    slug: "pottery",
    description:
      "Discover Sri Lanka's traditional pottery craftsmanship.",
  },
  {
    name: "Textiles",
    slug: "textiles",
    description:
      "Explore Sri Lankan weaving, fabrics, and textile traditions.",
  },
  {
    name: "Traditional Masks",
    slug: "masks",
    description:
      "Explore the artistry and heritage of traditional Sri Lankan masks.",
  },
  {
    name: "Brassware",
    slug: "brassware",
    description:
      "Discover traditional brass craftsmanship and metal artistry.",
  },
];

const seedCategories = async () => {
  try {
    await connectDB();

    for (const category of initialCategories) {
      await Category.updateOne(
        { slug: category.slug },
        {
          $setOnInsert: category,
        },
        { upsert: true }
      );
    }

    console.log("Initial craft categories seeded successfully.");
  } catch (error) {
    console.error("Failed to seed categories:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedCategories();
