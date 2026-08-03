const AppError = require('../utils/AppError');
const { supabase } = require('../config/supabase');

/**
 * PatientService — Business logic for patient management.
 *
 * Schema: public.patient
 *   id (uuid PK), created_at, user_id (→ auth.users), doctor_id (→ doctor.id),
 *   name (varchar), condition (text), notes (text)
 */
const patientService = {
  /**
   * List all patients belonging to a specific doctor. Supports search + pagination.
   */
  async listAll({ page, limit, search, doctorId }) {
    let query = supabase
      .from('patient')
      .select('id, user_id, name, condition, notes, doctor_id, created_at', { count: 'exact' });

    if (doctorId) {
      query = query.eq('doctor_id', doctorId);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const from = (page - 1) * limit;
    const to   = from + limit - 1;
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, error, count } = await query;
    if (error) throw new AppError('Gagal mengambil data pasien: ' + error.message, 500);

    return { data: data ?? [], total: count ?? 0 };
  },

  /**
   * Get a single patient by their patient-table PK (uuid).
   */
  async getById(patientId) {
    const { data, error } = await supabase
      .from('patient')
      .select('id, user_id, name, condition, notes, doctor_id, created_at')
      .eq('id', patientId)
      .single();

    if (error || !data) throw new AppError('Patient not found.', 404);
    return data;
  },

  /**
   * Get patient's own profile by auth user_id.
   */
  async getMyProfile(userId) {
    const { data, error } = await supabase
      .from('patient')
      .select('id, user_id, name, condition, notes, doctor_id, created_at')
      .eq('user_id', userId)
      .single();

    if (error || !data) throw new AppError('Profile not found.', 404);
    return data;
  },

  /**
   * Update patient profile (name, condition, notes only).
   */
  async updateProfile(userId, updates) {
    const safeFields = {};
    if (updates.name      !== undefined) safeFields.name      = updates.name;
    if (updates.condition !== undefined) safeFields.condition = updates.condition;
    if (updates.notes     !== undefined) safeFields.notes     = updates.notes;

    const { data, error } = await supabase
      .from('patient')
      .update(safeFields)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new AppError('Gagal update profil: ' + error.message, 500);
    return data;
  },
};

module.exports = patientService;
