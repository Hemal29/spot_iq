const AppError = require('../utils/AppError');

const handleJWTError = () => new AppError('Invalid token, please log in again', 401);

const handleJWTExpiredError = () => new AppError('Token expired, please log in again', 401);

const handleSequelizeValidationError = (err) => {
  const messages = err.errors.map((e) => e.message);
  return new AppError(`Invalid input: ${messages.join('. ')}`, 400);
};

const handleSequelizeUniqueConstraintError = (err) => {
  const field = err.errors?.[0]?.path || 'field';
  return new AppError(`Duplicate value for ${field}. Please use another value.`, 400);
};

const errorHandler = (err, req, res, next) => {
  let error = { ...err, message: err.message, stack: err.stack };

  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
  if (err.name === 'SequelizeValidationError') error = handleSequelizeValidationError(err);
  if (err.name === 'SequelizeUniqueConstraintError') error = handleSequelizeUniqueConstraintError(err);

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

const notFound = (req, res, next) => {
  const error = new AppError(`Route not found - ${req.originalUrl}`, 404);
  next(error);
};

module.exports = { errorHandler, notFound };
