const authService = require('../services/auth.service');

/**
 * AuthController — Handles HTTP layer for authentication.
 * Delegates all business logic to authService.
 */
const authController = {
  /**
   * POST /api/v1/auth/register
   */
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return res.created({
        message: 'Registration successful. Welcome to Visensa!',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/auth/login
   */
  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      return res.ok({
        message: 'Login successful.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/auth/refresh
   */
  async refresh(req, res, next) {
    try {
      const result = await authService.refresh(req.body.refreshToken);
      return res.ok({ message: 'Token refreshed.', data: result });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/auth/me
   */
  async me(req, res) {
    return res.ok({ message: 'Authenticated user.', data: req.user });
  },
};

module.exports = authController;
