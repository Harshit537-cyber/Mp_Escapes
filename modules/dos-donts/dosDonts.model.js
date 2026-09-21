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
  fileType: {
    type: String, // pdf, docx, etc.
  },
});

const dosDontsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      default: "Dos & Don'ts",
    },
    description: {
      type: String,
      trim: true,
      default: "Safari discipline, monument etiquettes & safety norms",
    },
    files: [fileSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DosDonts", dosDontsSchema);