const express = require("express");
const router = express.Router();
const { upload } = require("../../middlewares/upload.middleware");
const destinationController = require("./destination.controller");

const uploadFields = upload.fields([
  { name: "images", maxCount: 5 },
  { name: "mapImage", maxCount: 1 },
]);


router.get("/summary", destinationController.getDestinationsSummary);
router.post("/", uploadFields, destinationController.createDestination);
router.put("/:id", uploadFields, destinationController.updateDestination);

router.get("/", destinationController.getAllDestinations);
router.get("/names", destinationController.getAllDestinationNames);
router.get("/:id", destinationController.getDestinationById);
router.delete("/:id", destinationController.deleteDestination);



module.exports = router;