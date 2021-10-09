const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const basketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  items: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true, min: 0 },
      quantity: { type: Number, required: true, min: 1 },
      isAvailable: { type: Boolean, required: true },
    },
  ],
});

basketSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Basket', basketSchema);
