const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

/**
 * Authenticate Middleware (JWT-based).
 *
 * Expects: Authorization: Bearer <token>
 *
 * Attaches `req.user` to the request on success.
 * Implementation of token-to-user lookup will be added
 * once Supabase is connected (see TODO below).
 */
const authenticate = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('No authentication token provided. Please log in.', 401));
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify token signature & expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. TODO: Fetch user from Supabase to confirm they still exist & are active.
    // Example (uncomment when Supabase is ready):
    //
    // const { data: user, error } = await supabase
    //   .from('users')
    //   .select('id, name, email, role, is_active')
    //   .eq('id', decoded.userId)
    //   .single();
    //
    // if (error || !user) return next(new AppError('User no longer exists.', 401));
    // if (!user.is_active) return next(new AppError('Account is deactivated.', 403));
    // req.user = user;

    // 4. Attach decoded payload until DB is ready
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    next(err); // Caught by globalErrorHandler (JWT errors handled there)
  }
};

/**
 * Generate Access Token.
 * @param {object} payload - { userId, email, role }
 * @returns {string} JWT token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Generate Refresh Token.
 * @param {object} payload - { userId }
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
};

module.exports = { authenticate, generateAccessToken, generateRefreshToken };
