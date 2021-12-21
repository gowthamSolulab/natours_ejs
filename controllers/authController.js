const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = function (id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined; // remove password from output
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  console.log('hello from client');
  const { email, password } = req.body;

  // 1. check email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2. check user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('incorrect email or password', 401));
  }

  // 3.If everything ok, send token to client
  createSendToken(user, 200, res);
});

// middleware
exports.protect = catchAsync(async (req, res, next) => {
  // 1. Getting token and check if it's there.
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! please login to access', 401)
    );
  }

  // 2. Verification token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  // 3.Check if user still exists
  const CurrentUser = await User.findById(decoded.id);
  if (!CurrentUser) {
    return next(new AppError('The user belonging to token does not exist'));
  }

  // 4. Check if user changed password after the token was issued.
  if (CurrentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('password has been changed , please login again', 401)
    );
  }

  // Grant Access to protected Route
  req.user = CurrentUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not  have permission to perform this action')
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based on Posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError(" User doesn't exist with this email id"), 404);
  }

  // 2. Generate the random reset token

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3. Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? submit a PATCH request with  your password and passwordConfirm to:${resetURL}.\n If you dont forget password then ignore this email`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset valid for 10 min! ',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    console.log(user.email);
    user.PasswordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError("Can't sending mail, try later!", 500));
  }
});

//
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based on the token.
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
  });

  console.log(user, Date.now());

  // 2. If token has not expired , and there is user, set the new password.
  if (!user) {
    return next(new AppError('Token is invalid or expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3. Update changePasswordAt property for the user .
  // pre save middleware to update changePasswordAt field

  // 4. Log the user in , send JWT.
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1. Get User from collection
  const user = await User.findOne({ email: req.user.email }).select(
    '+password'
  );

  // 2. Check if Posted current password is correct
  const { currentPassword, Password, PasswordConfirm } = req.body;

  if (
    !currentPassword ||
    !(await user.correctPassword(currentPassword, user.password))
  )
    return next(new AppError('Please enter current password'));

  // 3. If so update password
  user.password = Password;
  user.passwordConfirm = PasswordConfirm;
  await user.save();

  // 4. Log user in, send JWT
  createSendToken(user, 200, res);
});
