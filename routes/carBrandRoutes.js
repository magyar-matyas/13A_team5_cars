const express = require("express");
const router = express.Router();
const CarBrand = require("../models/CarBrand");
const CarModel = require("../models/CarModel");



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
        // Find the highest existing _id value in the collection
        const lastBrand = await CarBrand.findOne().sort({ _id: -1 });
        const lastId = lastBrand ? parseInt(lastBrand._id.replace("BR", "")) : 0;

        // Generate the next ID based on the highest existing ID
        const newId = `BR${String(lastId + 1).padStart(3, "0")}`;

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

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBrand = await CarBrand.findByIdAndDelete(id);
        if (!deletedBrand) {
            return res.status(404).json({ error: "Brand not found" });
        }
        res.status(200).json({ message: "Brand deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updatedBrand = await CarBrand.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedBrand) {
            return res.status(404).json({ error: "Brand not found" });
        }
        res.status(200).json(updatedBrand);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
