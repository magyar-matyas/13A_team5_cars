require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const carBrandRoutes = require("./routes/carBrandRoutes");
const carModelRoutes = require("./routes/carModelRoutes");

const app = express();
app.use("/brands", carBrandRoutes);
app.use("/models", carModelRoutes);

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.use("/brands", carBrandRoutes);
app.use("/models", carModelRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
