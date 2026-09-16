const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    tagline: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [String],
      validate: [
        (val) => val.length <= 4,
        "Maximum 4 images are allowed",
      ],
      default: [],
    },
    story: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    whyItStandsOut: {
      type: String,
      required: true,
    },
    signatureExperience: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Hotel", hotelSchema);