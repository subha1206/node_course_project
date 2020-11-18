const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const tourRouter = require('./routes/tourRouters');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const errorHandeler = require('./controllers/errorController');

const app = express();
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message:
    'Too many request from your system, please try again after some time!',
});
app.use('/api', limiter);

app.use(
  express.json({
    limit: '10kb',
  })
);

// NOTE: Data sanitization noSQL

app.use(mongoSanitize());

// NOTE: Data sanitization XSS

// FIXME: have to implement that

// NOTE: Prevent parameter population
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'price',
      'difficulty',
      'maxGroupSize',
    ],
  })
);

app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});

app.use(errorHandeler);

module.exports = app;
