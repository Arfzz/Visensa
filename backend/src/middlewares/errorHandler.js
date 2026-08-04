const AppError = require('../utils/AppError');

/**
 * Global Error Handler Middleware.
 * Catches all errors forwarded via next(err).
 */
const globalErrorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  // Default error values
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // ---- Zod Validation Error ----
  if (err.name === 'ZodError') {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // ---- JWT Errors ----
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token. Please log in again.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired. Please log in again.' });
  }

  // ---- Operational Errors (thrown by us using AppError) ----
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // ---- Programming / Unknown Errors ----
  // Don't leak error details in production
  console.error('UNCAUGHT ERROR:', err);
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong.' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

/**
 * 404 Not Found Handler.
 * Must be registered AFTER all routes.
 */
const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found.`, 404));
};

module.exports = { globalErrorHandler, notFoundHandler };
