const mongoose = require("mongoose");

const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    tagline: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [String],
      validate: [
        (val) => val.length <= 5,
        "Maximum 5 images are allowed",
      ],
      default: [],
    },
    description: {
      type: String,
      required: true,
    },
    highlights: {
      type: [String],
      default: [],
    },
    essentialTravelInfo: {
      weatherAndSeasonality: {
        type: String,
        default: "",
      },
      nearestAirport: {
        type: String,
        default: "",
      },
      nearestRailhead: {
        type: String,
        default: "",
      },
      roadConnectivity: {
        type: String,
        default: "",
      },
      canBeCombinedWith: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Destination", destinationSchema);