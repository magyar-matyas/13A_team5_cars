const mongoose = require("mongoose");

const carBrandSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    brand_name: { type: String, required: true },
    country_of_origin: { type: String, required: true },
    founded_year: { type: Number, required: true },
    website: { type: String, required: true }
}, { collection: 'Car_Brands' }); 

module.exports = mongoose.model("CarBrand", carBrandSchema);