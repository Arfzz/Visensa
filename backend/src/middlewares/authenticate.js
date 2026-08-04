const AppError = require('../utils/AppError');
const { supabase } = require('../config/supabase');

/**
 * Authenticate Middleware (Supabase JWT).
 * Verifies the Bearer token, then enriches req.user with
 * role + profile from the doctor/patient table so that
 * authorize() middleware can work correctly.
 *
 * Schema:
 *   doctor  — id, created_at, user_id, name
 *   patient — id, created_at, user_id, doctor_id, name, condition, notes
 *
 * Expects: Authorization: Bearer <supabase_access_token>
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('No authentication token provided. Please log in.', 401));
    }

    const token = authHeader.split(' ')[1];

    // 1. Verify token via Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return next(new AppError('Token tidak valid atau sudah kedaluwarsa.', 401));
    }

    // 2. Determine role — check doctor table first
    const { data: doctorProfile } = await supabase
      .from('doctor')
      .select('id, name')
      .eq('user_id', user.id)
      .single();

    let role, name, profile;

    if (doctorProfile) {
      role    = 'doctor';
      name    = doctorProfile.name;
      profile = doctorProfile; // { id, name }
    } else {
      const { data: patientProfile } = await supabase
        .from('patient')
        .select('id, name, condition, notes, doctor_id')
        .eq('user_id', user.id)
        .single();

      role    = 'patient';
      name    = patientProfile?.name ?? '';
      profile = patientProfile ?? {};
    }

    // 3. Attach enriched user to request
    req.user = {
      id:      user.id,    // auth.users.id (uuid)
      email:   user.email,
      role,
      name,
      profile,             // contains the row's own `id` (patient/doctor table PK)
    };

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { authenticate };