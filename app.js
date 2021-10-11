const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const usersRoutes = require('./routes/users-routes');
const itemsRoutes = require('./routes/items-routes');
const basketsRoutes = require('./routes/baskets-routes');
const HttpError = require('./models/HttpError');

const app = express();

// cors header
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

// parsing request body
app.use(bodyParser.json());

app.use('/api/users', usersRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/baskets', basketsRoutes);
app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({
    message: error.message || 'An unknown error occurred!',
  });
});

// connecting to MongoDB Database Cluster
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.uprmu.mongodb.net/ecommerce-checkout?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    },
  )
  .then(() => {
    console.log('connected!');
    app.listen(process.env.PORT || 5000);
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = app;
