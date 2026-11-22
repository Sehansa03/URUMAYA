
const cloudinary = require("../../config/cloudinary");

const uploadStoryImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image.",
      });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "urumaya/heritage-stories",
          resource_type: "image",
        },
        (error, uploadedImage) => {
          if (error) {
            reject(error);
          } else {
            resolve(uploadedImage);
          }
        }
      );

      stream.end(req.file.buffer);
    });

    return res.status(201).json({
      success: true,
      message: "Story image uploaded successfully.",
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (error) {
    console.error("Story image upload error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to upload story image.",
    });
  }
};

module.exports = { uploadStoryImage };
