const {
  validateAvailability,
  validateMinPrice,
  checkFraud,
  getItems,
} = require('../utils/validate-basket');

module.exports = () => {
  return async (req, res, next) => {
    const { itemIds } = req.body;

    try {
      const items = await getItems(itemIds);
      await validateAvailability(items);
      await validateMinPrice(items);
      await checkFraud(items);

      req.body = items;
    } catch (err) {
      next(err);
    }

    return next();
  };
};
