const express = require("express");
const viewsController = require("../controllers/viewController");
const router = express.Router();

router.get("/", viewsController.getOverview);
router.get("/tours", viewsController.getTour);
router.get("/login", viewsController.getLogin);
// router.get("/user", viewsController.getUser);

module.exports = router;
