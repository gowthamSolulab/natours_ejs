const express = require("express");
const viewsController = require("../controllers/viewController");
const authController = require("../controllers/authController");
const router = express.Router();

router.use(authController.isLoggedIn);
router.get("/", viewsController.getOverview);

router.get("/tours", viewsController.getTour);
router.get("/login", viewsController.getLogin);

// router.get("/user", viewsController.getUser);

module.exports = router;
