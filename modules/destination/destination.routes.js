const express = require("express");
const router = express.Router();
const { upload } = require("../../middlewares/upload.middleware");
const destinationController = require("./destination.controller");

router.post(
  "/",
  upload.array("images", 5),
  destinationController.createDestination
);

router.get("/", destinationController.getAllDestinations);
router.get("/:id", destinationController.getDestinationById);
router.delete("/:id", destinationController.deleteDestination);

module.exports = router;