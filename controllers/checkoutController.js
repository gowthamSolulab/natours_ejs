const catchAsync = require("../utils/catchAsync");
const stripeController = require("../utils/stripe");
const { handleResponse, handleError } = require("../utils/responseHandler");
const {
  default: strictTransportSecurity,
} = require("helmet/dist/middlewares/strict-transport-security");

const stripe = require("stripe")(
  "sk_test_51JPkNQSGmAfV4DJDikEEAE6waE7NXPImUNY4zSKB5ZxsAywOczXQXJRuF2tR5BtyIQ7oqw4bxbH81JdatlVjDytR00hSEI9CG5"
);

exports.checkoutSession = catchAsync(async (req, res) => {
  const { customerId, cardDetails } = req.body;

  //   //checkout using stripe payment
  const card = await stripeController.addCardToCustomer(
    cardDetails,
    customerId
  );
  if (card) {
    const paymentIntent = await stripeController.createPaymentIntent(
      customerId
    );
    if (paymentIntent) {
      const payment = await stripeController.confirmPayment(
        paymentIntent.id,
        card.id
      );
      if (payment) {
        const data = {
          message: "payment done successfully",
          amount: payment.amount,
        };
        return handleResponse(200, data, res);
      }
    }
  }
  return handleError(500, res);
});

exports.getCard = catchAsync(async (req, res) => {
  const { customerId } = req.body;
  const { default_source } = await stripeController.getCustomer(customerId);
  if (default_source) {
    const card = await stripeController.getCard(customerId, default_source);
    return handleResponse(200, card, res);
  }
  return handleError(500, res);
});

exports.deleteCard = catchAsync(async (req, res) => {
  const { customerId } = req.body;
  const { default_source } = await stripeController.getCustomer(customerId);
  if (default_source) {
    const card = await stripeController.deleteCard(customerId, default_source);
    return handleResponse(200, card, res);
  }
  return handleError(500, res);
});
