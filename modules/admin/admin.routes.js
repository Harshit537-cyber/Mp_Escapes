const express = require("express");
const { registerAdmin, loginAdmin, logoutAdmin , getAdminProfile} = require("./admin.controller");
const { upload, uploadToCloudinary } = require("../../middlewares/upload.middleware");
const { verifyAdmin } = require("../../middlewares/auth.middleware");


const router = express.Router();

router.post("/register", upload.single("image"), uploadToCloudinary, registerAdmin);
router.post("/login", loginAdmin);
router.post("/logout", logoutAdmin);

router.get("/profile", verifyAdmin, getAdminProfile);


module.exports = router;