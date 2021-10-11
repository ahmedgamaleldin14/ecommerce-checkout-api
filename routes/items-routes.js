const express = require('express');
const { check } = require('express-validator');

const itemsControllers = require('../controllers/items-controllers');

const router = express.Router();

router.get('/', itemsControllers.getAllItems);

router.get('/:id', itemsControllers.getItemById);

router.post(
  '/create',
  [
    check('name').not().isEmpty(),
    check('serialNumber').not().isEmpty(),
    check('quantity').isFloat({ min: 1 }),
    check('price').isFloat({ min: 0 }),
  ],
  itemsControllers.addItem,
);

router.patch(
  '/:id',
  [
    check('name').not().isEmpty(),
    check('quantity').isFloat({ min: 0 }),
    check('price').isFloat({ min: 0 }),
  ],
  itemsControllers.updateItem,
);

// router.patch(
//   '/buy/:id',
//   [check('quantity').isFloat({ min: 1 })],
//   itemsControllers.buyItem,
// );

module.exports = router;
