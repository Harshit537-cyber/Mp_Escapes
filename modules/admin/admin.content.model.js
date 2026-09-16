const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    pdf: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminContent", contentSchema);