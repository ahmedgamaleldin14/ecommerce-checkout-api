const express = require('express');
const { check } = require('express-validator');

const basketControllers = require('../controllers/basket-controllers');
const basketValidation = require('../middlewares/basket-validation');

const router = express.Router();

router.post(
  '/create/:userId',
  [
    check('items.*.id').not().isEmpty(),
    check('items.*.quantity').isFloat({ min: 1 }),
  ],
  basketValidation(),
  basketControllers.createBasket,
);

router.post(
  '/:basketid/order',
  check('email').isEmail(),
  check('cardNumber')
    .isLength({ min: 16, max: 16 })
    .matches(/\d{16}/),
  check('expMonth').isLength({ min: 1, max: 2 }),
  check('expYear').isLength({ min: 4, max: 4 }).matches(/\d{4}/),
  check('cvc').isLength({ min: 3, max: 3 }).matches(/\d{3}/),
  basketControllers.placeOrder,
);

module.exports = router;
