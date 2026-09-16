const AdminContent = require("./admin.content.model");
const cloudinary = require("cloudinary").v2;

const createContent = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const contentData = {
      admin: req.admin.id,
      title,
      description,
    };

    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        contentData.image = {
          url: req.files.image[0].cloudinaryUrl || req.files.image[0].path,
          publicId: req.files.image[0].cloudinaryPublicId || req.files.image[0].filename,
        };
      }

      if (req.files.pdf && req.files.pdf[0]) {
        contentData.pdf = {
          url: req.files.pdf[0].cloudinaryUrl || req.files.pdf[0].path,
          publicId: req.files.pdf[0].cloudinaryPublicId || req.files.pdf[0].filename,
        };
      }
    }

    const content = await AdminContent.create(contentData);

    res.status(201).json({
      success: true,
      message: "Content created successfully",
      content,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllContents = async (req, res) => {
  try {
    const contents = await AdminContent.find().populate("admin", "name email");

    res.status(200).json({
      success: true,
      count: contents.length,
      contents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getContentById = async (req, res) => {
  try {
    const content = await AdminContent.findById(req.params.id).populate("admin", "name email");

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    res.status(200).json({
      success: true,
      content,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateContent = async (req, res) => {
  try {
    const { title, description } = req.body;
    const content = await AdminContent.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    if (title) content.title = title;
    if (description) content.description = description;

    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        if (content.image && content.image.publicId) {
          await cloudinary.uploader.destroy(content.image.publicId);
        }
        content.image = {
          url: req.files.image[0].cloudinaryUrl || req.files.image[0].path,
          publicId: req.files.image[0].cloudinaryPublicId || req.files.image[0].filename,
        };
      }

      if (req.files.pdf && req.files.pdf[0]) {
        if (content.pdf && content.pdf.publicId) {
          await cloudinary.uploader.destroy(content.pdf.publicId, { resource_type: "raw" });
        }
        content.pdf = {
          url: req.files.pdf[0].cloudinaryUrl || req.files.pdf[0].path,
          publicId: req.files.pdf[0].cloudinaryPublicId || req.files.pdf[0].filename,
        };
      }
    }

    await content.save();

    res.status(200).json({
      success: true,
      message: "Content updated successfully",
      content,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteContent = async (req, res) => {
  try {
    const content = await AdminContent.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    if (content.image && content.image.publicId) {
      await cloudinary.uploader.destroy(content.image.publicId);
    }

    if (content.pdf && content.pdf.publicId) {
      await cloudinary.uploader.destroy(content.pdf.publicId, { resource_type: "raw" });
    }

    await content.deleteOne();

    res.status(200).json({
      success: true,
      message: "Content deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createContent,
  getAllContents,
  getContentById,
  updateContent,
  deleteContent,
};