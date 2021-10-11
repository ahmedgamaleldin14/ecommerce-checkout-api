# E-Commerce Checkout Process Rest APIs

## Frameworks

The backend is built using Nodejs / Expressjs framework and MongoDB Database

## How to run the app

First, make sure Nodejs and npm packages are installed, then inside directory folder:
```
npm install
npm start
```
Then, you can send requests on localhost:5000

You do not have to setup MongoDB cluster as it is already running using ATLAS.

## Schemas
We have 3 schemas User, Item, and Basket

Each Item has name, serialNumber, quantity, price, and availability flag.
Each Basket has a list of items and related to a specific user.

## Validation

1. Validate basket items availbility
2. Validate that total basket price is above 100.
3. Check if the user is fraud by ensuring the total price does not exceed 1500 money value.

## Credit Card Integration

We used Stripe library to be able to simulate a payment method for the items in the basket.

## Design Pattern

We used MCV desgin pattern without the view part and the code is asynchronous.
