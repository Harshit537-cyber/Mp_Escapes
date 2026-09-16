const express = require("express");
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("./category.controller");
const { upload, uploadCategoryImages } = require("../../middlewares/upload.middleware");
const { verifyAdmin } = require("../../middlewares/auth.middleware");

const router = express.Router();

const uploadFields = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "fallbackImage", maxCount: 1 },
]);

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

router.post("/", verifyAdmin, uploadFields, uploadCategoryImages, createCategory);
router.put("/:id", verifyAdmin, uploadFields, uploadCategoryImages, updateCategory);
router.delete("/:id", verifyAdmin, deleteCategory);

module.exports = router;