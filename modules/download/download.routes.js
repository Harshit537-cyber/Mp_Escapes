const express = require("express");
const router = express.Router();
const multer = require("multer");
const downloadController = require("./download.controller");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

router.post("/", upload.array("files"), downloadController.uploadCategoryFiles);
router.get("/", downloadController.getAllCategoriesWithFiles);
router.get("/:id", downloadController.getCategoryById);
router.get("/:id/zip", downloadController.downloadCategoryZip);
router.delete("/:id", downloadController.deleteCategory);

module.exports = router;