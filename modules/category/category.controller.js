const Category = require("./category.model");
const cloudinary = require("../../config/cloudinary");

const createCategory = async (req, res) => {
  try {
    const { id, order, tag, title, localeHighlight, description, link } = req.body;

    if (!id || !order || !tag || !title || !localeHighlight || !description || !link) {
      return res.status(400).json({
        success: false,
        message: "All fields (id, order, tag, title, localeHighlight, description, link) are required",
      });
    }

    const existingCategory = await Category.findOne({ customId: id.toLowerCase() });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this id already exists",
      });
    }

    if (!req.mainImage) {
      return res.status(400).json({
        success: false,
        message: "Main image is required",
      });
    }

    const category = await Category.create({
      customId: id,
      order,
      tag,
      title,
      localeHighlight,
      description,
      link,
      image: req.mainImage,
      fallbackImage: req.fallbackImage || { url: "", publicId: "" },
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: 1 });
    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findOne({
      $or: [{ customId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findOne({
      $or: [{ customId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const { order, tag, title, localeHighlight, description, link } = req.body;

    if (order) category.order = order;
    if (tag) category.tag = tag;
    if (title) category.title = title;
    if (localeHighlight) category.localeHighlight = localeHighlight;
    if (description) category.description = description;
    if (link) category.link = link;

    if (req.mainImage) {
      if (category.image?.publicId) {
        await cloudinary.uploader.destroy(category.image.publicId);
      }
      category.image = req.mainImage;
    }

    if (req.fallbackImage) {
      if (category.fallbackImage?.publicId) {
        await cloudinary.uploader.destroy(category.fallbackImage.publicId);
      }
      category.fallbackImage = req.fallbackImage;
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findOne({
      $or: [{ customId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (category.image?.publicId) {
      await cloudinary.uploader.destroy(category.image.publicId);
    }
    if (category.fallbackImage?.publicId) {
      await cloudinary.uploader.destroy(category.fallbackImage.publicId);
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};