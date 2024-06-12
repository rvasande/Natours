const path = require('path')
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoute');
const userRouter = require('./routes/userRoute');
const reviewRoute = require('./routes/reviewRoute')

const app = express();

app.set('view engine', 'pug')
app.set('views', path.join(__dirname,'views'))

// 1) GLOBAL MIDDLEWARES
// set security HTTP headers
app.use(helmet());

// developement logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// rate limiter for same IP
const limiter = rateLimit({
  limit: 100,
  windowMs: 60 * 60 * 1000,
  message: ' Too many request for this IP! Please try again later.',
});

app.use('/api', limiter);

// body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

//Data sanitize against NoSQL injection
// remove $ and . operators from req.body/query/params
app.use(mongoSanitize());

// Data sanitize against XSS (cross site scripting)
//remove or prevent from html code paasing to server
app.use(xss());

//http parameter pollution (remove duplicate fields from query string)
app.use(
  hpp({ 
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

//serving static files
app.use(express.static(path.join(__dirname,'public')));

// test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES

app.use('/',(req,res) =>{
  res.status(200).render('base',{
    tour:'the park comper',
    user:'rushi'
  })
})
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews',reviewRoute)

app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`)
  // err.status = 'fali'
  // err.statusCode = 404

  // ⬇️ replace

  // anything is pass in next() means error is happen and skip all middlewares in stack and directly sent error to global error handling middleware
  next(new AppError(`Can't find ${req.originalUrl} on this server!`), 404);
});

// global error handling middleware. all error in this application handle by this middleware
// only execute this middleware when error is happen
// first arguement of this function is ERROR
// four arguement means express automaticallay knows that this is a ERROR handling middleware
app.use(globalErrorHandler);

module.exports = app;
