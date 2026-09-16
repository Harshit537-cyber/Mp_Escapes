const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
  },
});

const downloadCategorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    files: [fileSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DownloadCategory", downloadCategorySchema);