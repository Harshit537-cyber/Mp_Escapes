const express = require("express");
const {
  createContent,
  getAllContents,
  getContentById,
  updateContent,
  deleteContent,
} = require("./admin.content.controller");
const { upload, uploadToCloudinary } = require("../../middlewares/upload.middleware");
const { verifyAdmin } = require("../../middlewares/auth.middleware");

const router = express.Router();

const uploadFields = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "pdf", maxCount: 1 },
]);

router.post("/", verifyAdmin, uploadFields, uploadToCloudinary, createContent);
router.get("/", getAllContents);
router.get("/:id", getContentById);
router.put("/:id", verifyAdmin, uploadFields, uploadToCloudinary, updateContent);
router.delete("/:id", verifyAdmin, deleteContent);

module.exports = router;