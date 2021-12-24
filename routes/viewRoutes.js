const express = require("express");
const viewsController = require("../controllers/viewController");
const authController = require("../controllers/authController");
const router = express.Router();

router.get("/", authController.isLoggedIn, viewsController.getOverview);
router.get("/tours", authController.isLoggedIn, viewsController.getTour);
router.get("/login", authController.isLoggedIn, viewsController.getLogin);
router.get("/me", authController.protect, viewsController.getAccount);

router.post(
  "/submit-user-data",
  authController.protect,
  viewsController.updateUserData
);

module.exports = router;