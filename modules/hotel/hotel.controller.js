const Hotel = require("./hotel.model");
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

exports.createHotel = async (req, res) => {
  try {
    const {
      name,
      location,
      tagline,
      story,
      city,
      whyItStandsOut,
      signatureExperience,
    } = req.body;

    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      if (req.files.length > 4) {
        return res.status(400).json({
          success: false,
          message: "Maximum 4 images are allowed",
        });
      }

      for (const file of req.files) {
        const uploadResult = await uploadBufferToCloudinary(
          file.buffer,
          "luxury_hotels"
        );
        imageUrls.push(uploadResult.secure_url);
      }
    }

    const hotel = await Hotel.create({
      name,
      location,
      tagline,
      images: imageUrls,
      story,
      city,
      whyItStandsOut,
      signatureExperience,
    });

    return res.status(201).json({
      success: true,
      message: "Hotel created successfully",
      data: hotel,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: hotels.length,
      data: hotels,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getHotelById = async (req, res) => {
  try {
    const { id } = req.params;
    const hotel = await Hotel.findById(id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: hotel,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const existingHotel = await Hotel.findById(id);

    if (!existingHotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    const {
      name,
      location,
      tagline,
      story,
      city,
      whyItStandsOut,
      signatureExperience,
      existingImages,
    } = req.body;

    let updatedImages = [];

    if (existingImages) {
      const parsed = parseField(existingImages);
      updatedImages = Array.isArray(parsed) ? parsed : [parsed];
    } else if (!req.files || req.files.length === 0) {
      updatedImages = existingHotel.images;
    }

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadBufferToCloudinary(
          file.buffer,
          "luxury_hotels"
        );
        updatedImages.push(uploadResult.secure_url);
      }
    }

    if (updatedImages.length > 4) {
      return res.status(400).json({
        success: false,
        message: "Maximum 4 images are allowed",
      });
    }

    const updateData = {};

    if (name) updateData.name = name;
    if (location) updateData.location = location;
    if (tagline) updateData.tagline = tagline;
    if (story) updateData.story = story;
    if (city) updateData.city = city;
    if (whyItStandsOut) updateData.whyItStandsOut = whyItStandsOut;
    if (signatureExperience) updateData.signatureExperience = signatureExperience;
    if (updatedImages.length > 0) updateData.images = updatedImages;

    const updatedHotel = await Hotel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Hotel updated successfully",
      data: updatedHotel,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const hotel = await Hotel.findByIdAndDelete(id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hotel deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};