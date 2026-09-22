const express = require('express');
const router = express.Router();
const mediaController = require('./media.controller');
const { uploadMediaFiles } = require('../../middlewares/upload.middleware');


router.post('/upload', uploadMediaFiles, mediaController.createMedia);
router.get('/', mediaController.getAllMedia);
router.delete('/:id', mediaController.deleteMedia);

module.exports = router;