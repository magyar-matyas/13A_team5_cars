const mongoose = require("mongoose");

const CarModelSchema = new mongoose.Schema({
  model_id: { type: String, required: true, unique: true },
  model_name: String,
  brand_id: { type: String, required: true },
  year: Number,
  car_type: String,
  price: Number
});

module.exports = mongoose.model("CarModel", CarModelSchema, "Cars_Models");
