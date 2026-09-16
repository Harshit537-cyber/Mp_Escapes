const express = require("express");
const router = express.Router();
const { upload } = require("../../middlewares/upload.middleware");
const hotelController = require("./hotel.controller");

router.post("/", upload.array("images", 4), hotelController.createHotel);
router.put("/:id", upload.array("images", 4), hotelController.updateHotel);
router.get("/", hotelController.getAllHotels);
router.get("/:id", hotelController.getHotelById);
router.delete("/:id", hotelController.deleteHotel);

module.exports = router;