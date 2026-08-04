/**
 * Response Helper — Utility for standardizing API responses.
 * All responses follow the format: { success, message, data, meta? }
 */

const sendSuccess = (res, { message = 'Success', data = null, statusCode = 200, meta = undefined } = {}) => {
  const body = {
    success: true,
    message,
    data,
  };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
};

const sendCreated = (res, { message = 'Resource created', data = null } = {}) => {
  return sendSuccess(res, { message, data, statusCode: 201 });
};

const sendError = (res, { message = 'Internal Server Error', statusCode = 500, errors = undefined } = {}) => {
  const body = {
    success: false,
    message,
  };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

const sendPaginated = (res, { message = 'Success', data = [], page, limit, total }) => {
  const totalPages = Math.ceil(total / limit);
  return sendSuccess(res, {
    message,
    data,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
};

module.exports = { sendSuccess, sendCreated, sendError, sendPaginated };
