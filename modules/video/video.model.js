const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    cityName: {
      type: String,
      required: [true, "City name is required"],
      trim: true,
    },
    videoName: {
      type: String,
      required: [true, "Video name is required"],
      trim: true,
    },
    videoUrl: {
      type: String,
      required: [true, "Video file is required"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Video", videoSchema);