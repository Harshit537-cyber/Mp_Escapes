const mongoose = require("mongoose");

const mapSchema = new mongoose.Schema(
  {
    cityName: {
      type: String,
      required: [true, "City name is required"],
      trim: true,
    },
    mapImage: {
      type: String,
      required: [true, "Map image is required"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Map", mapSchema);