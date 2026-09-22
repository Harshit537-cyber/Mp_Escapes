const Guidelines = require("./guidelines.model");
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

const uploadToCloudinary = (buffer, originalName, folderType) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: `guidelines/${folderType}`,
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

exports.createGuidelines = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const allFiles = req.files || [];

    if (allFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Kam se kam ek PDF ya DOCX file upload karein",
      });
    }

    const uploadedPdfs = [];
    const uploadedDocx = [];

    for (const file of allFiles) {
      const ext = file.originalname.split(".").pop().toLowerCase();

      if (ext === "pdf") {
        const result = await uploadToCloudinary(file.buffer, file.originalname, "pdfs");
        uploadedPdfs.push({
          originalName: file.originalname,
          fileUrl: result.secure_url,
          publicId: result.public_id,
        });
      } else if (["docx", "doc"].includes(ext)) {
        const result = await uploadToCloudinary(file.buffer, file.originalname, "docx");
        uploadedDocx.push({
          originalName: file.originalname,
          fileUrl: result.secure_url,
          publicId: result.public_id,
        });
      }
    }

    const data = await Guidelines.create({
      title,
      description: description || "",
      pdfFiles: uploadedPdfs,
      docxFiles: uploadedDocx,
    });

    return res.status(201).json({
      success: true,
      message: "Guidelines successfully create ho gayi",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllGuidelines = async (req, res) => {
  try {
    const list = await Guidelines.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getGuidelinesById = async (req, res) => {
  try {
    const data = await Guidelines.findById(req.params.id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Record nahi mila",
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.downloadSingleFile = async (req, res) => {
  try {
    const { id, fileId } = req.params;
    const record = await Guidelines.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record nahi mila",
      });
    }

    const file = record.pdfFiles.id(fileId) || record.docxFiles.id(fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File nahi mili",
      });
    }

    const response = await axios.get(file.fileUrl, {
      responseType: "stream",
    });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(file.originalName)}"`
    );
    res.setHeader(
      "Content-Type",
      response.headers["content-type"] || "application/octet-stream"
    );

    response.data.pipe(res);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.downloadGuidelinesZip = async (req, res) => {
  try {
    const record = await Guidelines.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record nahi mila",
      });
    }

    const allFiles = [...record.pdfFiles, ...record.docxFiles];

    if (allFiles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Download karne ke liye koi file nahi hai",
      });
    }

    const archive = getArchiveInstance({ zlib: { level: 9 } });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(record.title)}.zip"`
    );

    archive.pipe(res);

    for (const file of allFiles) {
      const response = await axios.get(file.fileUrl, { responseType: "stream" });
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

exports.deleteGuidelines = async (req, res) => {
  try {
    const record = await Guidelines.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record nahi mila",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Successfully delete ho gaya",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};