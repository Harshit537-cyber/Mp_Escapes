const Map = require("./map.model");
const cloudinary = require("../../config/cloudinary");


const uploadBufferToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};


exports.createMap = async (req, res) => {
  try {
    const { cityName } = req.body;

    if (!cityName) {
      return res.status(400).json({
        success: false,
        message: "City name is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Map image is required",
      });
    }

   
    const uploadResult = await uploadBufferToCloudinary(
      req.file.buffer,
      "city_maps"
    );

    const map = await Map.create({
      cityName,
      mapImage: uploadResult.secure_url,
    });

    return res.status(201).json({
      success: true,
      message: "City map uploaded successfully",
      data: map,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.getAllMaps = async (req, res) => {
  try {
    const maps = await Map.find().sort({ cityName: 1 });

    return res.status(200).json({
      success: true,
      count: maps.length,
      data: maps,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.getMapById = async (req, res) => {
  try {
    const { id } = req.params;
    const map = await Map.findById(id);

    if (!map) {
      return res.status(404).json({
        success: false,
        message: "Map not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: map,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.updateMap = async (req, res) => {
  try {
    const { id } = req.params;
    const { cityName } = req.body;

    const existingMap = await Map.findById(id);
    if (!existingMap) {
      return res.status(404).json({
        success: false,
        message: "Map not found",
      });
    }

    const updateData = {};
    if (cityName) updateData.cityName = cityName;

   
    if (req.file) {
      const uploadResult = await uploadBufferToCloudinary(
        req.file.buffer,
        "city_maps"
      );
      updateData.mapImage = uploadResult.secure_url;
    }

    const updatedMap = await Map.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "City map updated successfully",
      data: updatedMap,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.deleteMap = async (req, res) => {
  try {
    const { id } = req.params;
    const map = await Map.findByIdAndDelete(id);

    if (!map) {
      return res.status(404).json({
        success: false,
        message: "Map not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "City map deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};