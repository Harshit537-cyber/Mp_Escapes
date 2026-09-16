const express = require("express");
const router = express.Router();
const multer = require("multer");
const imageBankController = require("./imageBank.controller");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024,
    files: 200,
  },
});

router.post("/", upload.array("images", 150), imageBankController.uploadBulkImages);
router.get("/", imageBankController.getAllImages);
router.get("/download-all", imageBankController.downloadAllImagesZip);
router.delete("/:id", imageBankController.deleteImage);

module.exports = router;