const AppError = require('../utils/AppError');

/**
 * Roles available in the system.
 */
const ROLES = {
  DOCTOR: 'doctor',
  PATIENT: 'patient',
  ADMIN: 'admin',
};

/**
 * authorize — Role-based access control middleware factory.
 *
 * Usage:
 *   router.get('/patients', authenticate, authorize(ROLES.DOCTOR), patientController.list)
 *   router.get('/me', authenticate, authorize(ROLES.DOCTOR, ROLES.PATIENT), ...)
 *
 * @param {...string} allowedRoles - One or more roles permitted.
 * @returns Express middleware
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('You are not authenticated. Please log in first.', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. This route is restricted to: [${allowedRoles.join(', ')}].`,
          403
        )
      );
    }

    next();
  };
};

module.exports = { authorize, ROLES };
