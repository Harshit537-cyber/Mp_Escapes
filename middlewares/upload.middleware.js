const multer = require("multer");
const path = require("path");
const cloudinary = require("../config/cloudinary");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = /jpeg|jpg|png|webp|gif|svg/;
    const extname = allowedExtensions.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedExtensions.test(file.mimetype);

    if (extname || mimetype || file.mimetype.startsWith("image/")) {
      return cb(null, true);
    }

    cb(new Error("Only images (jpeg, jpg, png, webp, gif) are allowed"));
  },
});

const uploadToCloudinary = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: "admin_profiles" },
    (error, result) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: "Image upload failed",
        });
      }
      req.file.cloudinaryUrl = result.secure_url;
      req.file.cloudinaryPublicId = result.public_id;
      next();
    }
  );

  uploadStream.end(req.file.buffer);
};

module.exports = { upload, uploadToCloudinary };