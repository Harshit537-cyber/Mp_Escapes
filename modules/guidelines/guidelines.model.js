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
    required: true,
  },
});

const guidelinesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    pdfFiles: [fileSchema],
    docxFiles: [fileSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Guidelines", guidelinesSchema);