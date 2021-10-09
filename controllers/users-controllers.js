const { validationResult } = require('express-validator');
const HttpError = require('../models/HttpError');
const User = require('../models/User');
const passwordUtils = require('../utils/password-utils');

const createUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        '"Invalid inputs passed, please check your data"',
        422,
      ),
    );
  }

  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({
      email,
    });
    if (existingUser) {
      return next(new HttpError('The user already exists!', 422));
    }

    const hashedPassword = await passwordUtils.encryptPass(password);

    let newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });
    await newUser.save();

    newUser = newUser.toObject({ getters: true });
    delete newUser.password;
    res.status(201).json({ createdUser: newUser });
  } catch (err) {
    return next(
      new HttpError(
        'Creating the user failed, please try again!',
        500,
      ),
    );
  }
};

exports.createUser = createUser;
