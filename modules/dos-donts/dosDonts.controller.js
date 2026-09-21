const DosDonts = require("./dosDonts.model");
const cloudinary = require("../../config/cloudinary");
const archiver = require("archiver");
const axios = require("axios");

// Archiver instance helper
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

// Cloudinary raw/document upload helper
const uploadBufferToCloudinaryRaw = (buffer, originalName) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw", // PDF, DOC, DOCX ke liye 'raw' best rehta hai
        folder: "dos-donts-docs",
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

// 1. Upload Docs / Create Dos & Don'ts Entry
exports.createDosDonts = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Kam se kam ek document/file upload karein",
      });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      const uploadResult = await uploadBufferToCloudinaryRaw(
        file.buffer,
        file.originalname
      );

      const ext = file.originalname.split(".").pop();

      uploadedFiles.push({
        originalName: file.originalname,
        fileUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        fileType: ext,
      });
    }

    const docEntry = await DosDonts.create({
      title: title || "Dos & Don'ts",
      description: description || "Safari discipline, monument etiquettes & safety norms",
      files: uploadedFiles,
    });

    return res.status(201).json({
      success: true,
      message: "Dos & Don'ts documents successfully upload ho gaye",
      data: docEntry,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 2. Get All Dos & Don'ts list
exports.getAllDosDonts = async (req, res) => {
  try {
    const list = await DosDonts.find().sort({ createdAt: -1 });

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

// 3. Get Single Dos & Don'ts by ID
exports.getDosDontsById = async (req, res) => {
  try {
    const { id } = req.params;
    const docEntry = await DosDonts.findById(id);

    if (!docEntry) {
      return res.status(404).json({
        success: false,
        message: "Data nahi mila",
      });
    }

    return res.status(200).json({
      success: true,
      data: docEntry,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 4. Download Single File Directly (Frontend download ke liye)
exports.downloadSingleFile = async (req, res) => {
  try {
    const { id, fileId } = req.params;
    const docEntry = await DosDonts.findById(id);

    if (!docEntry) {
      return res.status(404).json({ success: false, message: "Record nahi mila" });
    }

    const targetFile = docEntry.files.id(fileId);
    if (!targetFile) {
      return res.status(404).json({ success: false, message: "File nahi mili" });
    }

    // Stream download directly to client
    const response = await axios.get(targetFile.fileUrl, {
      responseType: "stream",
    });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(targetFile.originalName)}"`
    );
    res.setHeader("Content-Type", response.headers["content-type"] || "application/octet-stream");

    response.data.pipe(res);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 5. Download All Files in a Category as ZIP
exports.downloadDosDontsZip = async (req, res) => {
  try {
    const { id } = req.params;
    const docEntry = await DosDonts.findById(id);

    if (!docEntry || !docEntry.files || docEntry.files.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Files nahi mili download ke liye",
      });
    }

    const archive = getArchiveInstance({ zlib: { level: 9 } });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(docEntry.title)}.zip"`
    );

    archive.pipe(res);

    for (const file of docEntry.files) {
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

// 6. Delete Dos & Don'ts
exports.deleteDosDonts = async (req, res) => {
  try {
    const { id } = req.params;
    const docEntry = await DosDonts.findByIdAndDelete(id);

    if (!docEntry) {
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