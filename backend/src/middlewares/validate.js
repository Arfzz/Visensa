const AppError = require('../utils/AppError');

/**
 * validate — Middleware factory for Zod schema validation.
 *
 * Usage:
 *   router.post('/register', validate(registerSchema), authController.register)
 *
 * @param {ZodSchema} schema - A Zod schema to validate against.
 * @param {'body'|'query'|'params'} source - Which part of the request to validate (default: 'body').
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      // Forward as ZodError to be caught by globalErrorHandler
      return next(result.error);
    }
    // Attach parsed & transformed data back to request
    req[source] = result.data;
    next();
  };
};

module.exports = { validate };
