const catchAsync = require("../utils/catchAsync");
const stripeService = require("../utils/stripe");
const { handleResponse, handleError } = require("../utils/responseHandler");

const stripe = require("stripe")(
  "sk_test_51JPkNQSGmAfV4DJDikEEAE6waE7NXPImUNY4zSKB5ZxsAywOczXQXJRuF2tR5BtyIQ7oqw4bxbH81JdatlVjDytR00hSEI9CG5"
);

exports.getCard = catchAsync(async (req, res) => {
  const { default_source } = await stripeService.getCustomer(req.params.id);
  if (default_source) {
    const card = await stripeService.getCard(req.params.id, default_source);
    return handleResponse(200, card, res);
  }
  return handleError(500, res);
});

exports.deleteCard = catchAsync(async (req, res) => {
  const { default_source } = await stripeService.getCustomer(req.params.id);
  if (default_source) {
    const card = await stripeService.deleteCard(req.params.id, default_source);
    return handleResponse(200, card, res);
  }
  return handleError(500, res);
});

exports.addCard = catchAsync(async (req, res) => {
  const { cardDetails } = req.body;
  const card = await stripeService.addCardToCustomer(
    req.params.id,
    cardDetails
  );
  if (card) return handleResponse(200, card, res);
  return handleError(500, res);
});

exports.createPaymentIntent = catchAsync(async (req, res) => {
  const { default_source } = await stripeService.getCustomer(req.params.id);
  if (default_source) {
    const paymentIntent = await stripeService.createPaymentIntent(
      req.params.id
    );
    return handleResponse(200, paymentIntent, res);
  }
  return handleError(500, res);
});

exports.confirmPayment = catchAsync(async (req, res) => {
  const { paymentIntentId, cardId } = req.body;

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (paymentIntent) {
    const paymentIntent = await stripeService.confirmPayment(
      paymentIntentId,
      cardId
    );
    return handleResponse(200, paymentIntent, res);
  }
  return handleError(500, res);
});
