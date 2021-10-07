// const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
// corse header
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// parsing request body
app.use(bodyParser.json({ limit: "50mb" }));

mongoose
  .connect(`mongodb://localhost:27017/${process.env.DB_NAME}`, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("connected!");
    app.listen(process.env.PORT || 5000);
  })
  .catch((err) => {
    console.log(err);
  });