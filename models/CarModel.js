const mongoose = require("mongoose");

const carModelSchema = new mongoose.Schema({
    _id: { type: String, required: true }, 
    model_name: { type: String, required: true },
    brand_id: { type: String, required: true },
    year: { type: Number, required: true },
    car_type: { type: String, required: true },
    price: { type: Number, required: true }
}, { collection: 'Cars_Models' }); 

module.exports = mongoose.model("CarModel", carModelSchema);