const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const adminRoutes = require("./modules/admin/admin.routes");
const userRoutes = require("./modules/user/user.routes");
const categoryRoutes = require("./modules/category/category.routes");
const destinationRoutes = require("./modules/destination/destination.routes");
const downloadRoutes = require("./modules/download/download.routes");
const imageBankRoutes = require("./modules/image-bank/imageBank.routes");
const hotelRoutes = require("./modules/hotel/hotel.routes");
const mapRoutes = require("./modules/map/map.routes"); // 👈 1. Map route import kiya

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/downloads", downloadRoutes);
app.use("/api/image-bank", imageBankRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/maps", mapRoutes); 

module.exports = app;