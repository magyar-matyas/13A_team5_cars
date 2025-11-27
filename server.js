require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const carBrandRoutes = require("./routes/carBrandRoutes");
const carModelRoutes = require("./routes/carModelRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/brands", carBrandRoutes);
app.use("/models", carModelRoutes);

console.log("MONGO_URI:", process.env.MONGO_URI);

if (process.env.NODE_ENV !== 'test') {
    mongoose
        .connect(process.env.MONGO_URI)
        .then(() => console.log("MongoDB connected"))
        .catch(err => console.error("MongoDB connection error:", err));

    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    module.exports = server;
} else {
    console.log("Running in test mode");
    module.exports = app;
}
