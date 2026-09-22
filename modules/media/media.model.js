const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    images: [
      {
        type: String 
      }
    ],
    videos: [
      {
        type: String 
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Media', mediaSchema);