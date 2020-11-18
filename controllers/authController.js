const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = generateToken(user._id);

  const cookieOpt = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOpt.secure = true;

  res.cookie('jwt', token, cookieOpt);

  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res) => {
  // const newUser = await User.create(req.body);
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email or password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  //   const isVerified = await user.checkPassword(password, user.password);

  if (!user || !(await user.comparePasswordWithDB(password, user.password))) {
    return next(new AppError('Incorrect Email or password', 401));
  }

  createSendToken(user, 200, req, res);
});

exports.protectRoute = async (req, res, next) => {
  // NOTE check if any token pass with the request

  let token;
  let decode;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'You are not logged in! Please log in to view the content',
    });
  }

  // NOTE decode the token for id and verification

  try {
    decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid token! please login again',
    });
  }

  // NOTE check if the user still exists on the database

  const currentUser = await User.findById(decode.id);

  if (!currentUser) {
    return res.status(401).json({
      status: 'fail',
      message: 'User no longer exists',
    });
  }

  // NOTE check user changed password after issuing the JWT

  if (currentUser.checkIfPasswordChanged(decode.iat)) {
    return res.status(401).json({
      status: 'fail',
      message: 'User changed his/her password! please login again',
    });
  }

  req.user = currentUser;
  next();
};

// NOTE for restricted action for user

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have the permission to perform this action',
          403
        )
      );
    }
    next();
  };
};

// NOTE  Password reset functionality

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // NOTE get user to send email

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with this email', 404));
  }

  // NOTE generate a random reset

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // NOTE send the token to user email

  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? please click on this ${resetUrl} link to reset your password.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (error) {
    console.log(error);
    user.passwordResetToken = undefined;
    user.passwordResetTime = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error, please try again', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //NOTE get user based on token

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTime: { $gt: Date.now() },
  });

  // NOTE validate and set new password

  if (!user) {
    return next(new AppError('Toekn is invalid or expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTime = undefined;

  await user.save();

  // NOTE update changed passwordat prop

  // NOTE log the user in

  const token = generateToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // NOTE get the user

  const user = await User.findById(req.user.id).select('+password');

  // console.log(user);

  // NOTE check if password is correct

  if (!user.comparePasswordWithDB(req.body.passwordCurrent, user.password)) {
    return next(new AppError('Your current password is wrong', 401));
  }
  // NOTE update the password

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // NOTE log the user in

  const token = generateToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});
