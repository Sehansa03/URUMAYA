
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

const upload = require("../../middleware/upload.middleware");

const {
  uploadStoryImage,
} = require("./story.upload.controller");

const router = express.Router();

// PUBLIC: Published stories
router.get("/", getStories);

// STAFF / ADMIN: Manage stories
router.get(
  "/manage",
  protect,
  authorize("staff", "admin"),
  getManagedStories
);

// STAFF / ADMIN: Upload story image
router.post(
  "/uploads",
  protect,
  authorize("staff", "admin"),
  upload.single("image"),
  uploadStoryImage
);

// STAFF / ADMIN: Create draft
router.post(
  "/",
  protect,
  authorize("staff", "admin"),
  validateStory(createStorySchema),
  createStory
);

// STAFF / ADMIN: Edit story
router.patch(
  "/:id",
  protect,
  authorize("staff", "admin"),
  validateStory(updateStorySchema),
  updateStory
);

// STAFF / ADMIN: Submit for approval
router.patch(
  "/:id/submit",
  protect,
  authorize("staff", "admin"),
  submitStory
);

// ADMIN: Approve
router.patch(
  "/:id/approve",
  protect,
  authorize("admin"),
  approveStory
);

// ADMIN: Reject
router.patch(
  "/:id/reject",
  protect,
  authorize("admin"),
  rejectStory
);

// PUBLIC: Story details
router.get("/:slug", getStoryBySlug);

module.exports = router;
