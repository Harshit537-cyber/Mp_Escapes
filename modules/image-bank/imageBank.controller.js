const ImageBank = require("./imageBank.model");
const cloudinary = require("../../config/cloudinary");
const archiver = require("archiver");
const axios = require("axios");

const getArchiveInstance = (options) => {
  if (typeof archiver === "function") {
    return archiver("zip", options);
  }
  if (archiver.ZipArchive) {
    return new archiver.ZipArchive(options);
  }
  if (archiver.default && typeof archiver.default === "function") {
    return archiver.default("zip", options);
  }
  throw new Error("Unable to initialize archiver");
};

const uploadBufferToCloudinary = (buffer, folder, originalname) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        use_filename: true,
        filename_override: originalname,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

const chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

exports.uploadBulkImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one image",
      });
    }

    const chunks = chunkArray(req.files, 10);
    const uploadedImages = [];

    for (const chunk of chunks) {
      const uploadResults = await Promise.all(
        chunk.map((file) =>
          uploadBufferToCloudinary(
            file.buffer,
            "image_bank",
            file.originalname
          ).then((res) => ({
            imageUrl: res.secure_url,
            publicId: res.public_id,
            originalName: file.originalname,
          }))
        )
      );
      uploadedImages.push(...uploadResults);
    }

    const savedImages = await ImageBank.insertMany(uploadedImages);

    return res.status(201).json({
      success: true,
      message: `${savedImages.length} images uploaded successfully`,
      data: savedImages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllImages = async (req, res) => {
  try {
    const images = await ImageBank.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: images.length,
      data: images,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.downloadAllImagesZip = async (req, res) => {
  try {
    const images = await ImageBank.find().sort({ createdAt: -1 });

    if (!images || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images found to download",
      });
    }

    const archive = getArchiveInstance({
      zlib: { level: 9 },
    });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="High-Res-Image-Bank.zip"'
    );

    archive.pipe(res);

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const response = await axios.get(img.imageUrl, {
        responseType: "stream",
      });
      const fileName = img.originalName || `image-${i + 1}.jpg`;
      archive.append(response.data, { name: fileName });
    }

    await archive.finalize();
  } catch (error) {
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await ImageBank.findByIdAndDelete(id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};