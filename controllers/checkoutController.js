const catchAsync = require("../utils/catchAsync");
const stripeService = require("../utils/stripe");
const { handleResponse, handleError } = require("../utils/responseHandler");

exports.checkoutSession = catchAsync(async (req, res) => {
  //checkout using stripe payment
  const { default_source } = await stripeService.getCustomer(req.user.stripeId);
  if (default_source) {
    const paymentIntent = await stripeService.createPaymentIntent(
      req.user.stripeId
    );
    const payment = await stripeService.confirmPayment(
      paymentIntent.id,
      default_source
    );
    if (payment) {
      const data = {
        message: "payment done successfully",
        amount: payment.amount / 100,
      };
      return handleResponse(200, data, res);
    }
  }
  return handleError(500, res);
});
