require("dotenv").config();
const express = require("express");
const cors = require("cors");

const carBrandRoutes = require("./routes/carBrandRoutes");
const carModelRoutes = require("./routes/carModelRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/brands", carBrandRoutes);
app.use("/models", carModelRoutes);

module.exports = app;
