const mongoose = require("mongoose");

const qrSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "MP Escapes Main QR",
      trim: true,
    },
    targetUrl: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    qrCodeImage: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("QR", qrSchema);