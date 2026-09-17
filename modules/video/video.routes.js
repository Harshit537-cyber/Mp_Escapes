const express = require("express");
const router = express.Router();
const { uploadVideo } = require("../../middlewares/upload.middleware"); // 👈 uploadVideo import kiya
const videoController = require("./video.controller");

router.post("/", uploadVideo.single("video"), videoController.createVideo);
router.get("/", videoController.getAllVideos);
router.get("/:id", videoController.getVideoById);
router.put("/:id", uploadVideo.single("video"), videoController.updateVideo);
router.delete("/:id", videoController.deleteVideo);

module.exports = router;