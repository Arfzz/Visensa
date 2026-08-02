const AppError = require('../utils/AppError');

/**
 * SessionService — Business logic for rehabilitation sessions.
 * All DB calls are stubbed. Replace with Supabase when ready.
 */

const MOCK_SESSIONS = [
  { id: 's-001', patientId: 'p-001', exerciseId: 'ex-001', exerciseName: 'Finger Spread', durationSeconds: 120, repsCompleted: 15, status: 'completed', createdAt: '2026-07-28T08:00:00Z' },
  { id: 's-002', patientId: 'p-001', exerciseId: 'ex-002', exerciseName: 'Hand Open/Close', durationSeconds: 90, repsCompleted: 20, status: 'completed', createdAt: '2026-07-29T08:30:00Z' },
  { id: 's-003', patientId: 'p-002', exerciseId: 'ex-001', exerciseName: 'Finger Spread', durationSeconds: 60, repsCompleted: 8, status: 'completed', createdAt: '2026-07-30T09:00:00Z' },
];

const sessionService = {
  /**
   * Create a new session after user completes an exercise.
   */
  async createSession(patientId, data) {
    // TODO: Supabase insert
    const newSession = {
      id: 's-' + Date.now(),
      patientId,
      ...data,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };
    return newSession;
  },

  /**
   * Get all sessions for a patient.
   */
  async getPatientSessions(patientId, { page, limit }) {
    // TODO: Supabase paginated query
    const all = MOCK_SESSIONS.filter((s) => s.patientId === patientId);
    const total = all.length;
    const data = all.slice((page - 1) * limit, page * limit);
    return { data, total };
  },

  /**
   * Get all sessions (Doctor overview).
   */
  async getAllSessions({ page, limit, patientId }) {
    // TODO: Supabase paginated query with optional patientId filter
    let all = [...MOCK_SESSIONS];
    if (patientId) all = all.filter((s) => s.patientId === patientId);
    const total = all.length;
    const data = all.slice((page - 1) * limit, page * limit);
    return { data, total };
  },

  /**
   * Get a single session by ID.
   */
  async getById(sessionId) {
    // TODO: Supabase single query
    const session = MOCK_SESSIONS.find((s) => s.id === sessionId);
    if (!session) throw new AppError('Session not found.', 404);
    return session;
  },
};

module.exports = sessionService;
