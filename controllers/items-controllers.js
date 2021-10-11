const { validationResult } = require('express-validator');
const aqp = require('api-query-params');

const HttpError = require('../models/HttpError');
const Item = require('../models/Item');

// add an item to the collection
const addItem = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        'Invalid inputs passed, please check your data',
        422,
      ),
    );
  }

  try {
    const { name, serialNumber, price, quantity } = req.body;

    // check for duplicates using serial number
    const duplicateItem = await Item.findOne({ serialNumber }).lean();
    if (duplicateItem) {
      return next(new HttpError('This item already exists', 422));
    }

    let newItem = new Item({
      name,
      serialNumber,
      price,
      quantity,
    });
    await newItem.save();

    newItem = newItem.toObject({ getters: true });
    res.status(201).json({ createdItem: newItem });
  } catch (err) {
    return next(
      new HttpError(
        'Creating the item failed, please try again!',
        500,
      ),
    );
  }
};

// get an item using item id
const getItemById = async (req, res, next) => {
  try {
    const itemId = req.params.id;
    const { number } = aqp(req.query);

    const item = await Item.findById(itemId).lean();
    if (!item.isAvailable) {
      return next(
        new HttpError('The item is not available at the moment', 400),
      );
    }

    // check if a specific quantity of this item required
    if (number) {
      // check if the oredered quantity did not exceed the limit
      if (item.quantity < number) {
        return next(
          new HttpError(
            'There is not enough number of this item at the moment.',
            400,
          ),
        );
      }
    }

    res.json({ data: item });
  } catch (err) {
    return next(
      new HttpError(
        'Getting the item has failed, please try again!',
        500,
      ),
    );
  }
};

// get all items
const getAllItems = async (req, res, next) => {
  try {
    const items = await Item.find({}).lean();
    res.json({ data: items });
  } catch (err) {
    return next(
      new HttpError(
        'Getting the items has failed, please try again!',
        500,
      ),
    );
  }
};

// update an item fields (name, price, quantity)
const updateItem = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        'Invalid inputs passed, please check your data.',
        422,
      ),
    );
  }

  const { name, price, quantity } = req.body;
  const itemId = req.params.id;
  try {
    const item = await Item.findById(itemId).exec();
    if (name) item.name = name;
    if (price) item.price = price;
    if (quantity) {
      // reset isAvailable flag if possible
      item.quantity = quantity;
      if (!item.isAvailable && item.quantity > 0) {
        item.isAvailable = true;
      }
    }

    await item.save();

    res.status(200).json({ item: item.toObject({ getters: true }) });
  } catch (err) {
    return next(
      new HttpError(
        'Something went wrong, could not update item.',
        500,
      ),
    );
  }
};

const buyItem = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        'Invalid inputs passed, please check your data.',
        422,
      ),
    );
  }

  const { quantity } = req.body;
  const itemId = req.params.id;
  try {
    const item = await Item.findById(itemId).exec();

    if (item.quantity < quantity) {
      return next(
        new HttpError('Not enough pieces exist for this item.', 400),
      );
    }

    item.quantity -= quantity;
    if (item.quantity === 0) item.isAvailable = false;
    const purchasedItem = {
      quantity,
      totalPrice: quantity * item.price,
    };

    await item.save();
    res.status(200).json({
      purchasedItem,
    });
  } catch (err) {
    return next(
      new HttpError('Something went wrong, could not buy item.', 500),
    );
  }
};

exports.addItem = addItem;
exports.getItemById = getItemById;
exports.updateItem = updateItem;
exports.buyItem = buyItem;
exports.getAllItems = getAllItems;
