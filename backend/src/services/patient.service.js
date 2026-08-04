const AppError = require('../utils/AppError');

/**
 * PatientService — Business logic for patient management.
 * All DB calls are stubbed. Replace with Supabase when ready.
 */

const MOCK_PATIENTS = [
  { id: 'p-001', name: 'Budi Santoso', email: 'budi@patient.com', role: 'patient', doctorId: 'd-001', dateOfBirth: '1990-05-12', createdAt: '2026-01-15T10:00:00Z' },
  { id: 'p-002', name: 'Siti Rahayu', email: 'siti@patient.com', role: 'patient', doctorId: 'd-001', dateOfBirth: '1985-08-22', createdAt: '2026-02-01T09:00:00Z' },
  { id: 'p-003', name: 'Ahmad Fauzi', email: 'ahmad@patient.com', role: 'patient', doctorId: 'd-002', dateOfBirth: '1992-11-30', createdAt: '2026-03-10T11:00:00Z' },
];

const patientService = {
  /**
   * Get all patients (Doctor only).
   */
  async listAll({ page, limit, search }) {
    // TODO: Supabase query with pagination & search filter
    let results = [...MOCK_PATIENTS];
    if (search) {
      results = results.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    const total = results.length;
    const data = results.slice((page - 1) * limit, page * limit);
    return { data, total };
  },

  /**
   * Get a single patient by ID.
   */
  async getById(patientId) {
    // TODO: Supabase .from('users').select('*').eq('id', patientId).single()
    const patient = MOCK_PATIENTS.find((p) => p.id === patientId);
    if (!patient) throw new AppError('Patient not found.', 404);
    return patient;
  },

  /**
   * Get my own profile (Patient only).
   */
  async getMyProfile(userId) {
    // TODO: Supabase query
    const patient = MOCK_PATIENTS.find((p) => p.id === userId);
    if (!patient) throw new AppError('Profile not found.', 404);
    return patient;
  },

  /**
   * Update patient profile.
   */
  async updateProfile(patientId, data) {
    // TODO: Supabase .from('users').update(data).eq('id', patientId)
    const patient = MOCK_PATIENTS.find((p) => p.id === patientId);
    if (!patient) throw new AppError('Patient not found.', 404);
    return { ...patient, ...data, updatedAt: new Date().toISOString() };
  },
};

module.exports = patientService;
