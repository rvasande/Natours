const AppError = require('./../utils/appError')

const handleCastErrorDB = (err) =>{
  const message = `Invalid ${err.path}:${err.value}.`
  return new AppError(message, 400) 
}
const handleDuplicateFieldsDB = (err) =>{
  const message = `${err.keyValue.name} is already exits`
  return new AppError(message, 400)
}

const handleValidationError = err =>{
 const error = Object.values(err.errors).map(el => el.message)//return array with only objects values
 const message = `Invalid input data => ${error.join(' || ')}`
  return new AppError(message,400)
}

const handleJwtError = () => new AppError('Invalid token! Please log in again', 401)

const handleExpiredTokenError = () => new AppError('Token was expired! Please log in again',401)

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.log('ERROR',err);
    res.status(err.statusCode).json({
      // err,
      status: err.status,
      message: 'something went wrong!',
    });
  }
};



module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = {...err}
    if(error.kind === 'ObjectId' && error.valueType === 'string') error = handleCastErrorDB(error) //invalid mongoose id OR this error is generated by mongoose
    if(error.code === 11000) error = handleDuplicateFieldsDB(error) // duplicate key OR same name filed
    if(error.name === 'ValidationError') error = handleValidationError(error) //mongoose error
    if(error.name === 'JsonWebTokenError') error = handleJwtError()
    if(error.name === 'TokenExpiredError') error = handleExpiredTokenError()
    sendErrorProd(error, res);
  }
};

// this function is actual global error handling middleware with four arguements
// simplly export this middleware and use in app.js as globalErrorHandler
