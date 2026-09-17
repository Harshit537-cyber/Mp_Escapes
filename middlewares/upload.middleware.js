const multer = require("multer");
const path = require("path");
const cloudinary = require("../config/cloudinary");

const storage = multer.memoryStorage();

// 1. Images ke liye (Purana wala)
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowedExtensions = /jpeg|jpg|png|webp|gif|svg/;
    const extname = allowedExtensions.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedExtensions.test(file.mimetype);

    if (extname || mimetype || file.mimetype.startsWith("image/")) {
      return cb(null, true);
    }

    cb(new Error("Only images are allowed"));
  },
});

// 2. 👇 Videos ke liye naya upload middleware
const uploadVideo = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB limit
  fileFilter: (req, file, cb) => {
    const allowedExtensions = /mp4|mkv|mov|avi|webm/;
    const extname = allowedExtensions.test(
      path.extname(file.originalname).toLowerCase()
    );
    const isVideoMime = file.mimetype.startsWith("video/");

    if (extname || isVideoMime) {
      return cb(null, true);
    }

    cb(new Error("Only video files (mp4, mov, avi, mkv, webm) are allowed!"));
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

const uploadCategoryImages = async (req, res, next) => {
  try {
    if (!req.files) return next();

    const uploadStreamPromise = (buffer, folder) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder },
          (error, result) => {
            if (error) {
              console.error("Cloudinary Error Details:", error);
              return reject(error);
            }
            resolve(result);
          }
        );
        stream.end(buffer);
      });
    };

    if (req.files.image && req.files.image[0]) {
      const result = await uploadStreamPromise(
        req.files.image[0].buffer,
        "categories"
      );
      req.mainImage = {
        url: result.secure_url,
        publicId: result.public_id,
      };
    }

    if (req.files.fallbackImage && req.files.fallbackImage[0]) {
      const result = await uploadStreamPromise(
        req.files.fallbackImage[0].buffer,
        "categories/fallbacks"
      );
      req.fallbackImage = {
        url: result.secure_url,
        publicId: result.public_id,
      };
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Image upload failed",
    });
  }
};

module.exports = { 
  upload, 
  uploadVideo, // 👈 Export kiya
  uploadToCloudinary, 
  uploadCategoryImages 
};