const express = require("express");
const router = express.Router();
const multer = require("multer");
const controller = require("./guidelines.controller");

const fileFilter = (req, file, cb) => {
  const ext = file.originalname.split(".").pop().toLowerCase();
  if (["pdf", "docx", "doc"].includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Sirf PDF aur DOCX files allowed hain"), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter,
});

router.post("/", upload.any(), controller.createGuidelines);
router.get("/", controller.getAllGuidelines);
router.get("/:id", controller.getGuidelinesById);
router.get("/:id/files/:fileId/download", controller.downloadSingleFile);
router.get("/:id/zip", controller.downloadGuidelinesZip);
router.delete("/:id", controller.deleteGuidelines);

module.exports = router;