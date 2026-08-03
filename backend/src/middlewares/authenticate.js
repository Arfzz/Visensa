const AppError = require('../utils/AppError');
const { supabase } = require('../config/supabase');

/**
 * Authenticate Middleware (Supabase JWT).
 * Expects: Authorization: Bearer <token>
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('No authentication token provided. Please log in.', 401));
    }

    const token = authHeader.split(' ')[1];

    // Minta Supabase verifikasi token JWT-nya
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return next(new AppError('Token tidak valid atau sudah kedaluwarsa.', 401));
    }

    // Pasang payload user ke request biar bisa dipake sama controller lain
    req.user = user;
    
    next();
  } catch (err) {
    next(err);
  }
};

// Lu udah nggak butuh fungsi generateAccessToken & generateRefreshToken di file ini, 
// hapus aja fungsi-fungsi itu biar kode lebih ringan dan nggak ngebingungin.

module.exports = { authenticate };