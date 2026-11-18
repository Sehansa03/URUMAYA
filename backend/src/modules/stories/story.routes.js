
const express = require("express");

const {
  getStories,
  getStoryBySlug,
  getManagedStories,
  createStory,
  updateStory,
  submitStory,
  approveStory,
  rejectStory,
} = require("./story.controller");

const {
  protect,
} = require("../../middleware/auth.middleware");

const {
  authorize,
} = require("../../middleware/role.middleware");

const {
  createStorySchema,
  updateStorySchema,
  validateStory,
} = require("./story.validation");

const router = express.Router();

// ============================================
// PUBLIC ROUTES
// ============================================

// Browse published heritage stories
router.get("/", getStories);

// ============================================
// STAFF & ADMIN ROUTES
// ============================================

// View managed stories
router.get(
  "/manage",
  protect,
  authorize("staff", "admin"),
  getManagedStories
);

// Create a story draft
router.post(
  "/",
  protect,
  authorize("staff", "admin"),
  validateStory(createStorySchema),
  createStory
);

// Edit an existing story
router.patch(
  "/:id",
  protect,
  authorize("staff", "admin"),
  validateStory(updateStorySchema),
  updateStory
);

// Submit story for approval
router.patch(
  "/:id/submit",
  protect,
  authorize("staff", "admin"),
  submitStory
);

// ============================================
// ADMIN ONLY ROUTES
// ============================================

// Approve and publish story
router.patch(
  "/:id/approve",
  protect,
  authorize("admin"),
  approveStory
);

// Reject story
router.patch(
  "/:id/reject",
  protect,
  authorize("admin"),
  rejectStory
);

// ============================================
// PUBLIC STORY DETAILS
// ============================================

// Keep this after /manage to avoid route conflicts
router.get("/:slug", getStoryBySlug);

module.exports = router;
