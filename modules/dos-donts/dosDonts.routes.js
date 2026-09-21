const express = require("express");
const router = express.Router();
const multer = require("multer");
const dosDontsController = require("./dosDonts.controller");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// APIs
router.post("/", upload.array("files"), dosDontsController.createDosDonts);
router.get("/", dosDontsController.getAllDosDonts);
router.get("/:id", dosDontsController.getDosDontsById);
router.get("/:id/files/:fileId/download", dosDontsController.downloadSingleFile);
router.get("/:id/zip", dosDontsController.downloadDosDontsZip);
router.delete("/:id", dosDontsController.deleteDosDonts);

module.exports = router;