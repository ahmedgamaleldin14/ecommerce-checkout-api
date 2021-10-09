const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const HttpError = require('../models/HttpError');
const Basket = require('../models/Basket');
const User = require('../models/User');

const createBasket = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        'Invalid inputs passed, please check your data',
        422,
      ),
    );
  }

  const itemsArray = req.body;
  const { userId } = req.params;

  try {
    const existingUser = await User.findById(userId).lean();
    if (!existingUser) {
      return next(new HttpError('The user does not exist!', 422));
    }

    const newBasket = new Basket({
      user: mongoose.Types.ObjectId(userId),
      items: itemsArray,
    });
    await newBasket.save();

    res
      .status(201)
      .json({ createdBasket: newBasket.toObject({ getters: true }) });
  } catch (err) {
    return next(
      new HttpError(
        'Creating the basket failed, please try again!',
        500,
      ),
    );
  }
};

const placeOrder = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        'Invalid inputs passed, please check your data',
        422,
      ),
    );
  }

  const stripeTokenId = req.body;
  const { baskedId } = req.params;

  try {
    const existingBasket = await User.findById(baskedId).lean();
    if (!existingBasket) {
      return next(new HttpError('The basket does not exist!', 422));
    }

    const { items } = existingBasket;
    let totalPrice = 0;
    items.forEach((item) => {
      const { quantity, price } = item;
      totalPrice += price * quantity;
    });

    chargeObj = {
      amount: totalPrice,
      source: stripeTokenId,
      currency: 'usd',
    };
    await stripe.charges.create(chargeObj);

    res.status(201).json({ charged: chargeObj });
  } catch (err) {
    return next(
      new HttpError(
        'Placing the order has failed, please try again!',
        500,
      ),
    );
  }
};

exports.createBasket = createBasket;
exports.placeOrder = placeOrder;
