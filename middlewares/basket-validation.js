const {
  validateAvailability,
  validateMinPrice,
  checkFraud,
  getItems,
} = require('../utils/validate-basket');

module.exports = () => {
  return async (req, res, next) => {
    const { itemsArr } = req.body;

    try {
      const items = await getItems(itemsArr);
      await validateAvailability(items);
      await validateMinPrice(items);
      await checkFraud(items);

      items.forEach((item) => {
        item.quantity = item.orderedQuantity;
        delete item.orderedQuantity;
      });

      req.body = items;
    } catch (err) {
      next(err);
    }

    return next();
  };
};
