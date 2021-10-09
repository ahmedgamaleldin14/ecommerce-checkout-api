const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  serialNumber: { type: String, required: true, unique: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0 },
  isAvailable: { type: Boolean, required: true, default: true },
});

itemSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Item', itemSchema);
