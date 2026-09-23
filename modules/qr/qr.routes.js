const express = require("express");
const router = express.Router();
const {
  generatePermanentQR,
  getSavedQR,
  downloadQRImage,
} = require("./qr.controller");

router.post("/generate", generatePermanentQR);
router.get("/", getSavedQR);
router.get("/download", downloadQRImage);

module.exports = router;