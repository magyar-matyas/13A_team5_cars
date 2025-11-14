const express = require("express");
const router = express.Router();
const CarModel = require("../models/CarModel");


router.get("/", async (req, res) => {
  const models = await CarModel.find();
  res.json(models);
});


router.post("/", async (req, res) => {
  try {
    const model = new CarModel(req.body);
    await model.save();
    res.status(201).json(model);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
