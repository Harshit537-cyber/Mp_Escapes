const Destination = require("./destination.model");
const cloudinary = require("../../config/cloudinary");

const parseField = (field) => {
  if (!field) return field;
  if (typeof field === "string") {
    try {
      return JSON.parse(field);
    } catch {
      return field;
    }
  }
  return field;
};

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

exports.createDestination = async (req, res) => {
  try {
    const {
      name,
      tagline,
      description,
      highlights,
      essentialTravelInfo,
    } = req.body;

    const parsedHighlights = parseField(highlights) || [];
    const parsedTravelInfo = parseField(essentialTravelInfo) || {};

    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadBufferToCloudinary(
          file.buffer,
          "destinations"
        );
        imageUrls.push(uploadResult.secure_url);
      }
    }

    const destination = await Destination.create({
      name,
      tagline,
      description,
      images: imageUrls,
      highlights: Array.isArray(parsedHighlights)
        ? parsedHighlights
        : [parsedHighlights],
      essentialTravelInfo: {
        weatherAndSeasonality: parsedTravelInfo.weatherAndSeasonality || "",
        nearestAirport: parsedTravelInfo.nearestAirport || "",
        nearestRailhead: parsedTravelInfo.nearestRailhead || "",
        roadConnectivity: parsedTravelInfo.roadConnectivity || "",
        canBeCombinedWith: Array.isArray(parsedTravelInfo.canBeCombinedWith)
          ? parsedTravelInfo.canBeCombinedWith
          : parsedTravelInfo.canBeCombinedWith
          ? [parsedTravelInfo.canBeCombinedWith]
          : [],
      },
    });

    return res.status(201).json({
      success: true,
      message: "Destination created successfully",
      data: destination,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllDestinations = async (req, res) => {
  try {
    const destinations = await Destination.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: destinations.length,
      data: destinations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getDestinationById = async (req, res) => {
  try {
    const { id } = req.params;
    const destination = await Destination.findById(id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: destination,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const destination = await Destination.findByIdAndDelete(id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Destination deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};