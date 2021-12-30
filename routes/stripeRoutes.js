const express = require("express");
const checkoutController = require("../controllers/checkoutController");
const stripeController = require("../controllers/stripeController");
const authController = require("../controllers/authController");
const router = express.Router();

router.use(authController.protect);

router.route("/checkout").get(checkoutController.checkoutSession);

router.route("/addcard").post(stripeController.addCard);
router.route("/deletecard").delete(stripeController.deleteCard);
router.route("/card").get(stripeController.getCard);

router.route("/payment-intent").get(stripeController.createPaymentIntent);
router.route("/confirm-payment").post(stripeController.confirmPayment);

module.exports = router;
