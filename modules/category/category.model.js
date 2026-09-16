const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    customId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    order: {
      type: String,
      required: true,
      trim: true,
    },
    tag: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    localeHighlight: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        required: true,
      },
    },
    fallbackImage: {
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.methods.toJSON = function () {
  const category = this.toObject();
  return {
    _mongoId: category._id,
    id: category.customId,
    order: category.order,
    tag: category.tag,
    title: category.title,
    localeHighlight: category.localeHighlight,
    description: category.description,
    image: category.image.url,
    fallbackImage: category.fallbackImage?.url || "",
    link: category.link,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
};

module.exports = mongoose.model("Category", categorySchema);