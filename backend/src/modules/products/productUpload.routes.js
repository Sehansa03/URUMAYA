
const express = require("express");

const upload = require("../../middleware/upload.middleware");
const { protect } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/role.middleware");

const {
  uploadProductImages,
} = require("./productUpload.controller");

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("staff", "admin"),
  (req, res, next) => {
    upload.array("images", 5)(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      next();
    });
  },
  uploadProductImages
);

module.exports = router;
