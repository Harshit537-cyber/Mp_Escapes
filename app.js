const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const adminRoutes = require("./modules/admin/admin.routes");
const userRoutes = require("./modules/user/user.routes");

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

module.exports = app;