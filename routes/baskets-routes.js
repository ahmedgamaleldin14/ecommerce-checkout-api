const express = require('express');
const { check } = require('express-validator');

const basketControllers = require('../controllers/basket-controllers');
const basketValidation = require('../middlewares/basket-validation');

const router = express.Router();

router.post(
  '/create/:userId',
  [check('itemIds').not().isEmpty()],
  basketValidation(),
  basketControllers.createBasket,
);

router.post(
  '/:basketid/order',
  check('stripeTokenId').not().isEmpty(),
  basketControllers.placeOrder,
);

module.exports = router;
