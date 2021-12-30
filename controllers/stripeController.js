const catchAsync = require("../utils/catchAsync");
const stripeService = require("../utils/stripe");
const { handleResponse, handleError } = require("../utils/responseHandler");

exports.getCard = catchAsync(async (req, res) => {
  const { default_source } = await stripeService.getCustomer(req.user.stripeId);
  if (default_source) {
    const { id, name, last4 } = await stripeService.getCard(
      req.user.stripeId,
      default_source
    );
    responseData = {
      card_id: id,
      customer_name: name,
      last4digits: last4,
    };
    return handleResponse(200, responseData, res);
  }
  return handleResponse(200, "card is not added ", res);
});

exports.deleteCard = catchAsync(async (req, res) => {
  const { default_source } = await stripeService.getCustomer(req.user.stripeId);
  if (default_source) {
    const deletedcard = await stripeService.deleteCard(
      req.user.stripeId,
      default_source
    );
    return handleResponse(200, deletedcard, res);
  }
  return handleResponse(200, "card is not added", res);
});

exports.addCard = catchAsync(async (req, res) => {
  const { id, name } = await stripeService.addCard(req.user.stripeId, req.body);
  responseData = {
    card_id: id,
    customer_name: name,
  };
  return handleResponse(200, responseData, res);
});

exports.createPaymentIntent = catchAsync(async (req, res) => {
  const { default_source } = await stripeService.getCustomer(req.user.stripeId);
  if (default_source) {
    const { amount, payment_method_types, id } =
      await stripeService.createPaymentIntent(req.user.stripeId);
    responseData = {
      paymentIntentId: id,
      cardId: default_source,
      amount: amount / 100,
      payment_method: payment_method_types[0],
    };
    return handleResponse(200, responseData, res);
  }
  return handleError(500, res);
});

exports.confirmPayment = catchAsync(async (req, res) => {
  const { paymentIntentId, cardId } = req.body;
  const payment = await stripeService.confirmPayment(paymentIntentId, cardId);
  const data = {
    message: "payment done successfully",
    amount: payment.amount / 100,
  };
  return handleResponse(200, data, res);
});
