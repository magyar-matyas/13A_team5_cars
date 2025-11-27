const express = require("express");
const router = express.Router();
const CarModel = require("../models/CarModel");


router.get("/", async (req, res) => {
    try {
        const models = await CarModel.find();
        res.json(models);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const modelCount = await CarModel.countDocuments(); // Count existing models in the database
        const newId = `M${String(modelCount + 1).padStart(3, "0")}`; // Generate ID based on count
        const model = new CarModel({ _id: newId, ...req.body });
        console.log("Generated Model:", model); // Debugging
        await model.save();
        res.status(201).json(model);
    } catch (err) {
        console.error("Error:", err.message); // Debugging
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;