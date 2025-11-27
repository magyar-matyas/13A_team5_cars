const express = require("express");
const router = express.Router();
const CarBrand = require("../models/CarBrand");
const CarModel = require("../models/CarModel");

let brandCounter = 4; // Start from the next available ID (e.g., BR004)

router.get("/", async (req, res) => {
    try {
        const brands = await CarBrand.find();
        res.json(brands);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const newId = `BR${String(brandCounter).padStart(3, "0")}`;
        brandCounter++;
        const brand = new CarBrand({ _id: newId, ...req.body });
        await brand.save();
        res.status(201).json(brand);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get("/:brand_id/models", async (req, res) => {
    try {
        const { brand_id } = req.params;
        const models = await CarModel.find({ brand_id });
        res.json(models);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
