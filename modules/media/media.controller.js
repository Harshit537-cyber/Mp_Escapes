const Media = require('./media.model');


exports.createMedia = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title zaroori hai!' });
    }

    let imagePaths = [];
    if (req.files && req.files['images']) {
      imagePaths = req.files['images'].map(file => file.path.replace(/\\/g, '/'));
    }

  
    let videoPaths = [];
    if (req.files && req.files['videos']) {
      videoPaths = req.files['videos'].map(file => file.path.replace(/\\/g, '/'));
    }

    const newMedia = new Media({
      title,
      description,
      images: imagePaths,
      videos: videoPaths
    });

    await newMedia.save();

    return res.status(201).json({
      success: true,
      message: 'Media successfully upload ho gaya!',
      data: newMedia
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};


exports.getAllMedia = async (req, res) => {
  try {
    const mediaList = await Media.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: mediaList
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const media = await Media.findByIdAndDelete(id);

    if (!media) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};