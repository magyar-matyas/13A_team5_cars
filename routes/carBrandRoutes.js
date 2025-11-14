const express = require("express");
const router = express.Router();
const CarBrand = require("../models/CarBrand");
const CarModel = require("../models/CarModel");


router.get("/", async (req, res) => {
  const brands = await CarBrand.find();
  res.json(brands);
});


router.post("/", async (req, res) => {
  try {
    const brand = new CarBrand(req.body);
    await brand.save();
    res.status(201).json(brand);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.get("/:brand_id/models", async (req, res) => {
  const { brand_id } = req.params;
  const models = await CarModel.find({ brand_id });
  res.json(models);
});

module.exports = router;
