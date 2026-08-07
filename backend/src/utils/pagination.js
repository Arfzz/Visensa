/**
 * Pagination Utility
 * Parses & validates pagination params from query string.
 * Usage: const { page, limit, offset } = parsePagination(req.query);
 */
const parsePagination = (query, defaults = {}) => {
  const page = Math.max(1, parseInt(query.page) || defaults.page || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || defaults.limit || 10));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

/**
 * Sorting Utility
 * Parses sort params safely. Whitelist allowed fields.
 * Usage: const { sortBy, sortOrder } = parseSort(req.query, ['name', 'createdAt'])
 */
const parseSort = (query, allowedFields = []) => {
  const sortOrder = query.sortOrder === 'desc' ? 'DESC' : 'ASC';
  const sortBy = allowedFields.includes(query.sortBy) ? query.sortBy : 'created_at';
  return { sortBy, sortOrder };
};

module.exports = { parsePagination, parseSort };
