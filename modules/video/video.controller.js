const Video = require("./video.model");
const cloudinary = require("../../config/cloudinary");

// Cloudinary Video Upload Helper (resource_type: "video" zaroori hota hai)
const uploadVideoBufferToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "video",
        chunk_size: 6000000, // Large video chunks handle karne ke liye
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// 1. Video Upload Karna (City Name + Video Name ke sath)
exports.createVideo = async (req, res) => {
  try {
    const { cityName, videoName } = req.body;

    if (!cityName || !videoName) {
      return res.status(400).json({
        success: false,
        message: "City name and Video name are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a video file",
      });
    }

    // Cloudinary folder 'city_videos' me upload hoga
    const uploadResult = await uploadVideoBufferToCloudinary(
      req.file.buffer,
      "city_videos"
    );

    const video = await Video.create({
      cityName,
      videoName,
      videoUrl: uploadResult.secure_url,
    });

    return res.status(201).json({
      success: true,
      message: "Video uploaded successfully",
      data: video,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 2. Sare Videos Fetch Karna (City-wise filter ka option bhi hai: ?city=Jaipur)
exports.getAllVideos = async (req, res) => {
  try {
    const { city } = req.query;
    const filter = {};

    // Agar URL me query aayi: /api/videos?city=Jaipur
    if (city) {
      filter.cityName = { $regex: city, $options: "i" }; // Case-insensitive match
    }

    const videos = await Video.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: videos.length,
      data: videos,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 3. Single Video By ID Fetch Karna
exports.getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: video,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 4. Video Details Update Karna (City, Name ya Nayi Video file)
exports.updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { cityName, videoName } = req.body;

    const existingVideo = await Video.findById(id);
    if (!existingVideo) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    const updateData = {};
    if (cityName) updateData.cityName = cityName;
    if (videoName) updateData.videoName = videoName;

    // Agar nayi video file upload ki ho
    if (req.file) {
      const uploadResult = await uploadVideoBufferToCloudinary(
        req.file.buffer,
        "city_videos"
      );
      updateData.videoUrl = uploadResult.secure_url;
    }

    const updatedVideo = await Video.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Video updated successfully",
      data: updatedVideo,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 5. Video Delete Karna
exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findByIdAndDelete(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};