/**
 * Response Formatter Middleware.
 * Attaches shorthand helper methods (res.ok, res.created, res.paginate) to every response object.
 * This way controllers can respond with a clean one-liner.
 */
const responseFormatter = (req, res, next) => {
  /**
   * Send a 200 OK success response.
   * @param {object} opts
   */
  res.ok = ({ message = 'Success', data = null, meta = undefined } = {}) => {
    const body = { success: true, message, data };
    if (meta) body.meta = meta;
    return res.status(200).json(body);
  };

  /**
   * Send a 201 Created response.
   * @param {object} opts
   */
  res.created = ({ message = 'Resource created successfully', data = null } = {}) => {
    return res.status(201).json({ success: true, message, data });
  };

  /**
   * Send a paginated 200 OK response.
   * @param {object} opts
   */
  res.paginate = ({ message = 'Success', data = [], page, limit, total }) => {
    const totalPages = Math.ceil(total / limit);
    return res.status(200).json({
      success: true,
      message,
      data,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
        hasNextPage: Number(page) < totalPages,
        hasPrevPage: Number(page) > 1,
      },
    });
  };

  next();
};

module.exports = { responseFormatter };
