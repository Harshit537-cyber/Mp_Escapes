const express = require("express");
const router = express.Router();
const { upload } = require("../../middlewares/upload.middleware");
const mapController = require("./map.controller");

// Routes
router.post("/", upload.single("mapImage"), mapController.createMap);
router.get("/", mapController.getAllMaps);
router.get("/:id", mapController.getMapById);
router.put("/:id", upload.single("mapImage"), mapController.updateMap);
router.delete("/:id", mapController.deleteMap);

module.exports = router;