const mongoose = require("mongoose");

const CarBrandSchema = new mongoose.Schema({
  brand_id: { type: String, required: true, unique: true },
  brand_name: String,
  country_of_origin: String,
  founded_year: Number,
  website: String
});

module.exports = mongoose.model("CarBrand", CarBrandSchema, "Car_Brands");
