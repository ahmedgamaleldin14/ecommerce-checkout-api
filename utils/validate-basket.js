const mongoose = require('mongoose');

const HttpError = require('../models/HttpError');
const Item = require('../models/Item');

const getItems = async (ids) => {
  try {
    const objectIds = ids.map((id) => {
      return mongoose.Types.ObjectId(id);
    });

    const items = await Item.find({
      _id: { $in: objectIds },
    }).lean();
    return items;
  } catch (err) {
    throw new HttpError('Some of the items does not exist.', 400);
  }
};

const validateAvailability = async (items) => {
  items.forEach((item) => {
    const { name, isAvailable, quantity } = item;
    if (!isAvailable || quantity < 1) {
      throw new HttpError(
        `This item {${name}} is not available`,
        400,
      );
    }
  });
};

const validateMinPrice = async (items) => {
  let totalPrice = 0;
  items.forEach((item) => {
    totalPrice += item.price;
  });
  if (totalPrice < 100) {
    throw new HttpError(
      `The minimum price for order is 100 L.E. Your current total basket price is ${totalPrice}`,
      400,
    );
  }
};

const checkFraud = async (items) => {
  let totalPrice = 0;
  items.forEach((item) => {
    const { price, quantity } = item;
    totalPrice += price * quantity;
  });
  if (totalPrice > 1500) {
    throw new HttpError('Warning ----> Fraud user', 400);
  }
};

module.exports = {
  validateAvailability,
  validateMinPrice,
  checkFraud,
  getItems,
};
