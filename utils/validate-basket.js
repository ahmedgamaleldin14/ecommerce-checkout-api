const HttpError = require('../models/HttpError');
const Item = require('../models/Item');

const getItems = async (itemsArr) => {
  try {
    const newItemsArr = await Promise.all(
      itemsArr.map(async (item) => {
        const existingItem = await Item.findById(item.id).lean();
        existingItem.orderedQuantity = item.quantity;
        return existingItem;
      }),
    );
    return newItemsArr;
  } catch (err) {
    throw new HttpError('Some of the items does not exist.', 400);
  }
};

const validateAvailability = async (items) => {
  items.forEach((item) => {
    const {
      name,
      isAvailable,
      quantity: originalQuantity,
      orderedQuantity,
    } = item;

    if (!isAvailable) {
      throw new HttpError(
        `This item {${name}} is not available.`,
        400,
      );
    } else if (originalQuantity - orderedQuantity < 0) {
      throw new HttpError(
        `Not enough quantity {${orderedQuantity}} for this item {${name}}`,
        400,
      );
    }
  });
};

const validateMinPrice = async (items) => {
  let totalPrice = 0;
  items.forEach((item) => {
    const { price, orderedQuantity } = item;
    totalPrice += price * orderedQuantity;
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
    const { price, orderedQuantity } = item;
    totalPrice += price * orderedQuantity;
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
