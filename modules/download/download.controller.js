const DownloadCategory = require("./download.model");
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

const uploadBufferToCloudinaryRaw = (buffer, originalName) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "downloads",
        use_filename: true,
        filename_override: originalName,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

exports.uploadCategoryFiles = async (req, res) => {
  try {
    const { categoryName } = req.body;

    if (!categoryName) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one file",
      });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      const uploadResult = await uploadBufferToCloudinaryRaw(
        file.buffer,
        file.originalname
      );

      uploadedFiles.push({
        originalName: file.originalname,
        fileUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      });
    }

    let category = await DownloadCategory.findOne({ categoryName });

    if (category) {
      category.files.push(...uploadedFiles);
      await category.save();
    } else {
      category = await DownloadCategory.create({
        categoryName,
        files: uploadedFiles,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Files uploaded successfully",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllCategoriesWithFiles = async (req, res) => {
  try {
    const categories = await DownloadCategory.find().sort({ categoryName: 1 });

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await DownloadCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.downloadCategoryZip = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await DownloadCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (!category.files || category.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files found in this category",
      });
    }

    const archive = getArchiveInstance({
      zlib: { level: 9 },
    });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(category.categoryName)}.zip"`
    );

    archive.pipe(res);

    for (const file of category.files) {
      const response = await axios.get(file.fileUrl, {
        responseType: "stream",
      });
      archive.append(response.data, { name: file.originalName });
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

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await DownloadCategory.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};