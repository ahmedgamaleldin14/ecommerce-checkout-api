const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const HttpError = require('../models/HttpError');
const Basket = require('../models/Basket');
const User = require('../models/User');
const Item = require('../models/Item');

// create basket for a specific user to be ready for order
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
    // check if this user exists
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

// place an order using the existing basket
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

  const { email, cardNumber, expMonth, expYear, cvc } = req.body;
  const { basketid } = req.params;

  try {
    const existingBasket = await Basket.findById(basketid).lean();
    if (!existingBasket) {
      return next(new HttpError('The basket does not exist!', 422));
    }

    const { items } = existingBasket;
    let totalPrice = 0;
    // for each item, deduct the quantity bought and calculate total price
    items.forEach(async (item) => {
      try {
        const { _id: itemId, quantity, price } = item;
        const existingItem = await Item.findById(itemId).exec();
        existingItem.quantity -= quantity;
        if (existingItem.quantity === 0) {
          existingItem.isAvailable = false;
        }
        await existingItem.save();
        totalPrice += price * quantity;
      } catch (err) {
        return next(
          new HttpError(
            'Placing the order has failed, please try again!',
            500,
          ),
        );
      }
    });

    // create a new customer
    const customer = await stripe.customers.create({
      email,
    });
    // prepare payment method
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: cardNumber,
        exp_month: expMonth,
        exp_year: expYear,
        cvc,
      },
    });
    // attach the payment to the created customer
    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: customer.id,
    });
    // charge the customer and finish payment
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice,
      customer: customer.id,
      currency: 'usd',
      payment_method: paymentMethod.id,
    });

    res.status(201).json({ payment: paymentIntent });
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
