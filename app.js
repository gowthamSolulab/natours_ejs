const path = require("path");
const express = require("express");
const morgan = require("morgan"); // http request logs
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const ejsLayouts = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");
// const bodyParser = require("body-parser");
const compression = require("compression");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const viewRouter = require("./routes/viewRoutes");
const stripeRouter = require("./routes/stripeRoutes");

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname, "views"));

app.set("view engine", "ejs");
app.use(ejsLayouts);
app.set("layout", "./layouts/index");

//  Global  Middlewares

// Set Security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit requests for API
const limiter = rateLimit({
  max: 100,
  windowMS: 60 * 60 * 1000,
  message: "Too many  requests from this IP , Please try again in an hour",
});
app.use("/api", limiter);

// json middleware for parsing data
app.use(
  express.json({
    limit: "10kb",
  })
);

app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Data Sanitization against NoSQl query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsAverage",
      "price",
      "maxGroupSize",
      "difficulty",
    ],
  })
);

// compress response body
app.use(compression());

//  Routes

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/stripe", stripeRouter);
app.use("/", viewRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server !`, 404));
});

// error
app.use(globalErrorHandler);

module.exports = app;
