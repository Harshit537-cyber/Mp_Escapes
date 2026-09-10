const express = require("express");
const { registerAdmin, loginAdmin } = require("./admin.controller");
const { upload, uploadToCloudinary } = require("../../middlewares/upload.middleware");

const router = express.Router();

router.post("/register", upload.single("image"), uploadToCloudinary, registerAdmin);
router.post("/login", loginAdmin);

module.exports = router;