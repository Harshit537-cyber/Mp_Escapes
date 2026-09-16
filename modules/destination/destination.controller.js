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
    let mapImageUrl = "";

    if (req.files) {
      if (req.files.images && req.files.images.length > 0) {
        for (const file of req.files.images) {
          const uploadResult = await uploadBufferToCloudinary(
            file.buffer,
            "destinations"
          );
          imageUrls.push(uploadResult.secure_url);
        }
      }

      if (req.files.mapImage && req.files.mapImage.length > 0) {
        const mapUploadResult = await uploadBufferToCloudinary(
          req.files.mapImage[0].buffer,
          "destinations/maps"
        );
        mapImageUrl = mapUploadResult.secure_url;
      }
    }

    const destination = await Destination.create({
      name,
      tagline,
      description,
      images: imageUrls,
      mapImage: mapImageUrl,
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

exports.updateDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const existingDestination = await Destination.findById(id);

    if (!existingDestination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    const {
      name,
      tagline,
      description,
      highlights,
      essentialTravelInfo,
      existingImages,
    } = req.body;

    let updatedImages = [];

    if (existingImages) {
      const parsedExistingImages = parseField(existingImages);
      updatedImages = Array.isArray(parsedExistingImages)
        ? parsedExistingImages
        : [parsedExistingImages];
    } else if (!req.files || !req.files.images) {
      updatedImages = existingDestination.images;
    }

    const updateData = {};

    if (req.files) {
      if (req.files.images && req.files.images.length > 0) {
        for (const file of req.files.images) {
          const uploadResult = await uploadBufferToCloudinary(
            file.buffer,
            "destinations"
          );
          updatedImages.push(uploadResult.secure_url);
        }
      }

      if (req.files.mapImage && req.files.mapImage.length > 0) {
        const mapUploadResult = await uploadBufferToCloudinary(
          req.files.mapImage[0].buffer,
          "destinations/maps"
        );
        updateData.mapImage = mapUploadResult.secure_url;
      }
    }

    if (updatedImages.length > 5) {
      return res.status(400).json({
        success: false,
        message: "Maximum 5 images are allowed",
      });
    }

    if (name) updateData.name = name;
    if (tagline) updateData.tagline = tagline;
    if (description) updateData.description = description;

    if (highlights) {
      const parsedHighlights = parseField(highlights);
      updateData.highlights = Array.isArray(parsedHighlights)
        ? parsedHighlights
        : [parsedHighlights];
    }

    if (essentialTravelInfo) {
      const parsedTravelInfo = parseField(essentialTravelInfo);
      updateData.essentialTravelInfo = {
        weatherAndSeasonality:
          parsedTravelInfo.weatherAndSeasonality ||
          existingDestination.essentialTravelInfo.weatherAndSeasonality,
        nearestAirport:
          parsedTravelInfo.nearestAirport ||
          existingDestination.essentialTravelInfo.nearestAirport,
        nearestRailhead:
          parsedTravelInfo.nearestRailhead ||
          existingDestination.essentialTravelInfo.nearestRailhead,
        roadConnectivity:
          parsedTravelInfo.roadConnectivity ||
          existingDestination.essentialTravelInfo.roadConnectivity,
        canBeCombinedWith: parsedTravelInfo.canBeCombinedWith
          ? Array.isArray(parsedTravelInfo.canBeCombinedWith)
            ? parsedTravelInfo.canBeCombinedWith
            : [parsedTravelInfo.canBeCombinedWith]
          : existingDestination.essentialTravelInfo.canBeCombinedWith,
      };
    }

    if (updatedImages.length > 0) {
      updateData.images = updatedImages;
    }

    const updatedDestination = await Destination.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Destination updated successfully",
      data: updatedDestination,
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

exports.getAllDestinationNames = async (req, res) => {
  try {
    const destinations = await Destination.find().select("name").sort({ name: 1 });

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