const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// functions for stripe

exports.getCustomer = async (customerId) => {
  return await stripe.customers.retrieve(customerId);
};

exports.createCustomer = async (data) => {
  const { name, email } = data;
  return await stripe.customers.create({
    email,
    name,
  });
};

exports.createPaymentMethod = async (data) => {
  // Add card by creating paymentMethod
  const { number, exp_month, exp_year, cvc, name } = data;
  return await stripe.paymentMethods.create({
    type: "card",
    card: {
      number,
      exp_month,
      exp_year,
      cvc,
      name,
    },
  });
};

exports.addCard = async (customerId, cardDetails) => {
  // create token in stripe to add card
  const token = await stripe.tokens.create({
    card: cardDetails,
  });
  return await stripe.customers.createSource(customerId, {
    source: token.id,
  });
};

exports.getCard = async (customerId, cardId) => {
  return await stripe.customers.retrieveSource(customerId, cardId);
};

exports.deleteCard = async (customerId, cardId) => {
  return await stripe.customers.deleteSource(customerId, cardId);
};

exports.createPaymentIntent = async (customerId) => {
  return await stripe.paymentIntents.create({
    amount: 20000,
    currency: "inr",
    payment_method_types: ["card"],
    customer: customerId,
    description: "Natours",
    shipping: {
      name: "Jenny Rosen",
      address: {
        line1: "510 Townsend St",
        postal_code: "98140",
        city: "San Francisco",
        state: "CA",
        country: "US",
      },
    },
  });
};

exports.confirmPayment = async (paymentIntentId, cardId) => {
  console.log(paymentIntentId, cardId);
  return await stripe.paymentIntents.confirm(paymentIntentId, {
    payment_method: cardId,
  });
};
