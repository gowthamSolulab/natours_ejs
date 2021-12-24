const Tour = require("../models/tourModel");
// const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find().lean();

  // Render the data

  res.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.query.tour })
    .populate({
      path: "reviews",
      fields: "review rating user",
    })
    .lean(); // mongoose object model to json model use lean
  if (!tour) {
    return next(new AppError("There is no tour with that name.", 404));
  }
  res.status(200).render("tour", { title: tour.name, tour });
});

exports.getLogin = (req, res, next) => {
  // Render the data

  res.status(200).render("login", {
    title: "Login",
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: "Your account",
  });
};

exports.updateUserData = (req, res, next) => {
  console.log(req.body);
};
