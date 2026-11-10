
const { Readable } = require("stream");
const cloudinary = require("../../config/cloudinary");

const allowedSignatures = {
  jpeg: (buffer) =>
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff,

  png: (buffer) =>
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(
      Buffer.from([
        0x89, 0x50, 0x4e, 0x47,
        0x0d, 0x0a, 0x1a, 0x0a,
      ])
    ),

  webp: (buffer) =>
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP",
};

const detectImageType = (buffer) => {
  if (allowedSignatures.jpeg(buffer)) return "image/jpeg";
  if (allowedSignatures.png(buffer)) return "image/png";
  if (allowedSignatures.webp(buffer)) return "image/webp";
  return null;
};

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "urumaya/products",
        resource_type: "image",
        transformation: [
          {
            width: 1600,
            height: 1600,
            crop: "limit",
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    Readable.from(buffer).pipe(stream);
  });

const uploadProductImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one image.",
      });
    }

    for (const file of req.files) {
      const detectedType = detectImageType(file.buffer);

      if (!detectedType || detectedType !== file.mimetype) {
        return res.status(400).json({
          success: false,
          message: "Invalid image file. Use JPG, PNG, or WebP.",
        });
      }
    }

    const uploadedImages = [];

    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer);

      uploadedImages.push({
        url: result.secure_url,
        publicId: result.public_id,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Images uploaded successfully.",
      data: {
        images: uploadedImages,
      },
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload product images.",
    });
  }
};

module.exports = {
  uploadProductImages,
};
