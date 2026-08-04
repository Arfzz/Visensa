const AppError = require('../utils/AppError');
const { supabase } = require('../config/supabase');

/**
 * SessionService — Business logic for exercise & minigame sessions.
 *
 * Schema:
 *   patient_schedules: id, created_at, patient_id, interval_days, next_reminder_at,
 *                      is_active, target_sessions, completed_sessions, status
 *   exercise_logs:     id, schedule_id (→ patient_schedules), duration_seconds,
 *                      session_number, pain_level, created_at
 *   minigame_logs:     id, patient_id (→ patient), minigame_id (→ minigame),
 *                      score, duration_seconds, max_combo, played_at
 *   gamification_stats: patient_id (→ patient), total_scheduled_exercises,
 *                       completed_exercises, total_minigame_score,
 *                       current_streak, highest_streak, updated_at
 */
const sessionService = {

  // ==============================================================
  // EXERCISE LOGS
  // ==============================================================

  /**
   * Log a completed exercise session.
   * Requires an active patient_schedule.
   *
   * @param {string} scheduleId    — patient_schedules.id (uuid)
   * @param {object} data          — { durationSeconds, sessionNumber, painLevel }
   */
  async logExercise(scheduleId, data) {
    // Validate schedule exists
    const { data: schedule, error: sErr } = await supabase
      .from('patient_schedules')
      .select('id, patient_id, is_active')
      .eq('id', scheduleId)
      .single();

    if (sErr || !schedule) throw new AppError('Jadwal latihan tidak ditemukan.', 404);
    if (!schedule.is_active) throw new AppError('Jadwal latihan sudah tidak aktif.', 400);

    // Insert exercise log
    const { data: log, error } = await supabase
      .from('exercise_logs')
      .insert([{
        schedule_id:      scheduleId,
        duration_seconds: data.durationSeconds,
        session_number:   data.sessionNumber ?? null,
        pain_level:       data.painLevel     ?? null,
      }])
      .select()
      .single();

    if (error) throw new AppError('Gagal menyimpan log latihan: ' + error.message, 500);

    // Update gamification_stats: increment completed_exercises
    await supabase.rpc('increment_completed_exercises', { p_patient_id: schedule.patient_id })
      .then(() => {}) // Non-blocking — fails silently if RPC not set up yet
      .catch(() => {});

    return log;
  },

  /**
   * Log a completed therapy session directly from the patient's JWT identity.
   * Does NOT require a patient_schedule — used by SessionComplete page.
   *
   * @param {string} patientId   — patient.id (table PK, from req.user.profile.id)
   * @param {object} data        — { durationSeconds, painLevel, sessionNumber? }
   */
  async logExerciseDirect(patientId, data) {
    // 1. Always create a new schedule to bypass the accidental UNIQUE constraint on schedule_id in exercise_logs
    const { data: newSchedule, error: nsError } = await supabase
      .from('patient_schedules')
      .insert([{
        patient_id: patientId,
        interval_days: 0,
        is_active: false, // False so it doesn't clutter active schedules
        target_sessions: 1,
        completed_sessions: 1,
        status: 'completed'
      }])
      .select('id')
      .single();

    if (nsError) throw new AppError('Gagal membuat jadwal latihan: ' + nsError.message, 500);
    const schedule = newSchedule;

    // 2. Derive running session number for this schedule
    const { count: totalLogs } = await supabase
      .from('exercise_logs')
      .select('id', { count: 'exact', head: true })
      .eq('schedule_id', schedule.id);

    const sessionNumber = (totalLogs ?? 0) + 1;

    // 3. Insert the log
    const { data: log, error } = await supabase
      .from('exercise_logs')
      .insert([{
        schedule_id:      schedule.id,
        duration_seconds: data.durationSeconds ?? 0,
        session_number:   data.sessionNumber ?? sessionNumber,
        pain_level:       data.painLevel ?? null,
      }])
      .select()
      .single();

    if (error) throw new AppError('Gagal menyimpan sesi latihan: ' + error.message, 500);

    // Best-effort: update gamification_stats
    await supabase.rpc('increment_completed_exercises', { p_patient_id: patientId })
      .then(() => {})
      .catch(() => {});

    return log;
  },

  /**
   * Get exercise history for the logged-in patient (via patient_schedules join).
   *
   * @param {string} patientId  — patient.id (table PK, NOT user_id)
   */
  async getPatientExerciseLogs(patientId, { page, limit }) {
    const from = (page - 1) * limit;
    const to   = from + limit - 1;

    // exercise_logs → patient_schedules → filter by patient_id
    const { data, error, count } = await supabase
      .from('exercise_logs')
      .select(
        'id, duration_seconds, session_number, pain_level, created_at, schedule:schedule_id(id, patient_id)',
        { count: 'exact' }
      )
      .eq('schedule.patient_id', patientId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new AppError('Gagal mengambil riwayat latihan: ' + error.message, 500);
    return { data: data ?? [], total: count ?? 0 };
  },

  /**
   * Doctor: get all exercise logs, optionally filtered by patientId.
   */
  async getAllExerciseLogs({ page, limit, patientId }) {
    const from = (page - 1) * limit;
    const to   = from + limit - 1;

    let query = supabase
      .from('exercise_logs')
      .select(
        'id, duration_seconds, session_number, pain_level, created_at, schedule:schedule_id(id, patient_id, patient:patient_id(id, name))',
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(from, to);

    if (patientId) {
      query = query.eq('schedule.patient_id', patientId);
    }

    const { data, error, count } = await query;
    if (error) throw new AppError('Gagal mengambil semua log latihan: ' + error.message, 500);
    return { data: data ?? [], total: count ?? 0 };
  },

  /**
   * Get a single exercise log by ID.
   */
  async getExerciseLogById(logId) {
    const { data, error } = await supabase
      .from('exercise_logs')
      .select('id, duration_seconds, session_number, pain_level, created_at, schedule:schedule_id(id, patient_id)')
      .eq('id', logId)
      .single();

    if (error || !data) throw new AppError('Exercise log not found.', 404);
    return data;
  },

  // ==============================================================
  // MINIGAME LOGS (Piano Tiles)
  // ==============================================================

  /**
   * Log a completed Piano Tiles minigame session.
   *
   * @param {string} patientId   — patient.id (table PK)
   * @param {object} data        — { minigameId?, score, durationSeconds, maxCombo }
   */
  async logMinigame(patientId, data) {
    const { data: log, error } = await supabase
      .from('minigame_logs')
      .insert([{
        patient_id:       patientId,
        minigame_id:      data.minigameId ?? null,
        score:            data.score,
        duration_seconds: data.durationSeconds,
        max_combo:        data.maxCombo ?? 0,
        played_at:        new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw new AppError('Gagal menyimpan hasil minigame: ' + error.message, 500);

    // Update gamification_stats — upsert total_minigame_score, streaks
    await sessionService._upsertGamificationStats(patientId, data.score);

    return log;
  },

  /**
   * Get minigame history for a patient, paginated.
   */
  async getPatientMinigameLogs(patientId, { page, limit }) {
    const from = (page - 1) * limit;
    const to   = from + limit - 1;

    const { data, error, count } = await supabase
      .from('minigame_logs')
      .select('id, score, duration_seconds, max_combo, played_at', { count: 'exact' })
      .eq('patient_id', patientId)
      .order('played_at', { ascending: false })
      .range(from, to);

    if (error) throw new AppError('Gagal mengambil riwayat minigame: ' + error.message, 500);
    return { data: data ?? [], total: count ?? 0 };
  },

  // ==============================================================
  // GAMIFICATION STATS
  // ==============================================================

  /**
   * Get aggregated gamification stats for a patient.
   * Reads from gamification_stats table + computes trend from minigame_logs.
   *
   * @param {string} patientId — patient.id (table PK)
   */
  async getPatientStats(patientId) {
    // Aggregated stats from gamification_stats table
    const { data: stats } = await supabase
      .from('gamification_stats')
      .select('total_scheduled_exercises, completed_exercises, total_minigame_score, current_streak, highest_streak, updated_at')
      .eq('patient_id', patientId)
      .single();

    // Last 7 minigame sessions for score trend
    const { data: trend } = await supabase
      .from('minigame_logs')
      .select('score, max_combo, duration_seconds, played_at')
      .eq('patient_id', patientId)
      .order('played_at', { ascending: false })
      .limit(7);

    // Last 7 exercise logs for exercise trend (via patient_schedules)
    const { data: exerciseTrend } = await supabase
      .from('exercise_logs')
      .select('duration_seconds, max_angle, pain_level, created_at, schedule:schedule_id(patient_id)')
      .eq('schedule.patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(7);

    return {
      gamification: stats ?? {
        total_scheduled_exercises: 0,
        completed_exercises: 0,
        total_minigame_score: 0,
        current_streak: 0,
        highest_streak: 0,
      },
      minigameTrend:  (trend ?? []).reverse(),
      exerciseTrend:  (exerciseTrend ?? []).reverse(),
    };
  },

  // ==============================================================
  // INTERNAL HELPERS
  // ==============================================================

  /**
   * Upsert gamification_stats after a minigame session.
   * Increments total_minigame_score and recalculates streak.
   */
  async _upsertGamificationStats(patientId, newScore) {
    try {
      const { data: existing } = await supabase
        .from('gamification_stats')
        .select('total_minigame_score, current_streak, highest_streak')
        .eq('patient_id', patientId)
        .single();

      const today          = new Date().toDateString();
      const currentStreak  = existing ? existing.current_streak + 1 : 1;
      const highestStreak  = existing ? Math.max(existing.highest_streak, currentStreak) : 1;
      const totalScore     = existing ? existing.total_minigame_score + newScore : newScore;

      await supabase
        .from('gamification_stats')
        .upsert({
          patient_id:          patientId,
          total_minigame_score: totalScore,
          current_streak:       currentStreak,
          highest_streak:       highestStreak,
          updated_at:           new Date().toISOString(),
        }, { onConflict: 'patient_id' });
    } catch {
      // Non-blocking — stat update failure should not block session logging
    }
  },
};

module.exports = sessionService;
