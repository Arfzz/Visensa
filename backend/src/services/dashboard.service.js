const AppError = require('../utils/AppError');
const { supabase } = require('../config/supabase');

/**
 * DashboardService — Aggregated statistics for Doctor Dashboard.
 *
 * Schema used:
 *   doctor            — id, user_id, name
 *   patient           — id, user_id, doctor_id, name, condition, notes
 *   patient_programs — id, patient_id, exercise_id, is_active, interval_days
 *   exercise_logs     — id, schedule_id, duration_seconds, max_angle, pain_level, created_at
 *   minigame_logs     — id, patient_id, score, duration_seconds, max_combo, played_at
 *   gamification_stats— patient_id, completed_exercises, total_scheduled_exercises,
 *                        total_minigame_score, current_streak, highest_streak
 */
const dashboardService = {
  /**
   * Doctor Dashboard Overview.
   * Returns summary stats + recent activity for the logged-in doctor.
   *
   * @param {string} doctorUserId — auth.users.id of the logged-in doctor
   */
  async getDoctorSummary(doctorUserId) {
    // 1. Get doctor's own record (we need doctor.id as PK)
    const { data: doctor, error: dErr } = await supabase
      .from('doctor')
      .select('id, name')
      .eq('user_id', doctorUserId)
      .single();

    if (dErr || !doctor) throw new AppError('Profil dokter tidak ditemukan.', 404);

    // 2. Total patients under this doctor
    const { count: totalPatients } = await supabase
      .from('patient')
      .select('id', { count: 'exact', head: true })
      .eq('doctor_id', doctor.id);

    // 3. Active patients = patients who had an exercise_log in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Get all patient IDs under this doctor
    const { data: doctorPatients } = await supabase
      .from('patient')
      .select('id')
      .eq('doctor_id', doctor.id);

    const doctorPatientIds = (doctorPatients ?? []).map((p) => p.id);
    let activePatients = 0;

    if (doctorPatientIds.length > 0) {
      // Get all schedules for these patients
      const { data: activeSchedules } = await supabase
        .from('patient_programs')
        .select('id, patient_id')
        .in('patient_id', doctorPatientIds);

      const scheduleIds = (activeSchedules ?? []).map((s) => s.id);

      if (scheduleIds.length > 0) {
        // Count patients who have recent exercise_logs
        const { data: recentLogs } = await supabase
          .from('exercise_logs')
          .select('schedule_id')
          .in('schedule_id', scheduleIds)
          .gte('created_at', sevenDaysAgo);

        // Map schedule_id back to patient_id and count unique patients
        const scheduleToPatient = Object.fromEntries(
          (activeSchedules ?? []).map((s) => [s.id, s.patient_id])
        );
        const activePids = new Set(
          (recentLogs ?? []).map((l) => scheduleToPatient[l.schedule_id]).filter(Boolean)
        );
        activePatients = activePids.size;
      }

      // Also count patients with minigame activity in last 7 days
      const { data: recentMinigames } = await supabase
        .from('minigame_logs')
        .select('patient_id')
        .in('patient_id', doctorPatientIds)
        .gte('played_at', sevenDaysAgo);

      const minigameActivePids = new Set((recentMinigames ?? []).map((m) => m.patient_id));
      // Merge both sets
      const allActivePids = new Set([...Array.from(minigameActivePids)]);
      activePatients = Math.max(activePatients, allActivePids.size);
    }

    // 4. Total exercise logs this month (across all doctor's patients)
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    let totalExercisesThisMonth = 0;

    if (doctorPatientIds.length > 0) {
      const { data: monthSchedules } = await supabase
        .from('patient_programs')
        .select('id')
        .in('patient_id', doctorPatientIds);

      const monthScheduleIds = (monthSchedules ?? []).map((s) => s.id);

      if (monthScheduleIds.length > 0) {
        const { count } = await supabase
          .from('exercise_logs')
          .select('id', { count: 'exact', head: true })
          .in('schedule_id', monthScheduleIds)
          .gte('created_at', startOfMonth);
        totalExercisesThisMonth = count ?? 0;
      }
    }

    // 5. Total minigame sessions this month
    let totalMinigamesThisMonth = 0;
    if (doctorPatientIds.length > 0) {
      const { count } = await supabase
        .from('minigame_logs')
        .select('id', { count: 'exact', head: true })
        .in('patient_id', doctorPatientIds)
        .gte('played_at', startOfMonth);
      totalMinigamesThisMonth = count ?? 0;
    }

    // 6. Recent 5 exercise logs across all doctor's patients
    let recentExerciseLogs = [];
    if (doctorPatientIds.length > 0) {
      const { data: schedules } = await supabase
        .from('patient_programs')
        .select('id, patient_id, patient:patient_id(id, name)')
        .in('patient_id', doctorPatientIds);

      const scheduleIds = (schedules ?? []).map((s) => s.id);
      const scheduleMap = Object.fromEntries((schedules ?? []).map((s) => [s.id, s.patient]));

      if (scheduleIds.length > 0) {
        const { data: logs } = await supabase
          .from('exercise_logs')
          .select('id, duration_seconds, session_number, pain_level, notes, created_at, schedule_id')
          .in('schedule_id', scheduleIds)
          .order('created_at', { ascending: false })
          .limit(5);

        recentExerciseLogs = (logs ?? []).map((l) => ({
          ...l,
          patient: scheduleMap[l.schedule_id] ?? null,
        }));
      }
    }

    // 7. Recent 5 minigame sessions
    let recentMinigameLogs = [];
    if (doctorPatientIds.length > 0) {
      const { data } = await supabase
        .from('minigame_logs')
        .select('id, score, duration_seconds, max_combo, played_at, patient:patient_id(id, name)')
        .in('patient_id', doctorPatientIds)
        .order('played_at', { ascending: false })
        .limit(5);
      recentMinigameLogs = data ?? [];
    }

    return {
      doctor: { name: doctor.name },
      stats: {
        totalPatients:           totalPatients ?? 0,
        activePatients,
        totalExercisesThisMonth,
        totalMinigamesThisMonth,
      },
      recentExerciseLogs,
      recentMinigameLogs,
    };
  },

  /**
   * Per-patient detail for Doctor.
   * Returns patient info, gamification_stats, and recent logs.
   *
   * @param {string} patientId — patient.id (table PK)
   */
  async getPatientDetail(patientId) {
    // Patient info
    const { data: patient, error: pErr } = await supabase
      .from('patient')
      .select('id, user_id, name, condition, notes, doctor_id, created_at')
      .eq('id', patientId)
      .single();

    if (pErr || !patient) throw new AppError('Pasien tidak ditemukan.', 404);

    // Gamification stats
    const { data: gStats } = await supabase
      .from('gamification_stats')
      .select('total_scheduled_exercises, completed_exercises, total_minigame_score, current_streak, highest_streak, updated_at')
      .eq('patient_id', patientId)
      .single();

    // Schedules for this patient (to join exercise_logs)
    const { data: schedules } = await supabase
      .from('patient_programs')
      .select('id, status, start_date, end_date')
      .eq('patient_id', patientId);

    const scheduleIds = (schedules ?? []).map((s) => s.id);

    // Recent exercise logs
    let recentExerciseLogs = [];
    if (scheduleIds.length > 0) {
      const { data } = await supabase
        .from('exercise_logs')
        .select('id, duration_seconds, session_number, pain_level, notes, created_at, schedule_id')
        .in('schedule_id', scheduleIds)
        .order('created_at', { ascending: false })
        .limit(10);
      recentExerciseLogs = data ?? [];
    }

    // Recent minigame logs + trend (last 7 for chart)
    const { data: minigameLogs } = await supabase
      .from('minigame_logs')
      .select('id, score, duration_seconds, max_combo, played_at')
      .eq('patient_id', patientId)
      .order('played_at', { ascending: false })
      .limit(10);

    // Score trend from last 7 minigame sessions (oldest first for chart)
    const minigameTrend = (minigameLogs ?? []).slice(0, 7).reverse();

    return {
      patient,
      gamificationStats: gStats ?? null,
      schedules:         schedules ?? [],
      recentExerciseLogs,
      recentMinigameLogs: minigameLogs ?? [],
      minigameTrend,
    };
  },
};

module.exports = dashboardService;
