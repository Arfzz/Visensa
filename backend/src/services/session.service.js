const AppError = require('../utils/AppError');
const { supabase } = require('../config/supabase');

/**
 * SessionService — Business logic for exercise & minigame sessions.
 *
 * Schema:
 *   patient_programs: id, created_at, patient_id, interval_days, next_reminder_at,
 *                      is_active, target_sessions, completed_sessions, status
 *   exercise_logs:     id, program_id (→ patient_programs), duration_seconds,
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
   * @param {string} scheduleId    — patient_programs.id (uuid)
   * @param {object} data          — { durationSeconds, sessionNumber, painLevel }
   */
  async logExercise(scheduleId, data) {
    // Validate program exists
    const { data: schedule, error: sErr } = await supabase
      .from('patient_programs')
      .select('id, patient_id, status')
      .eq('id', scheduleId)
      .single();

    if (sErr || !schedule) throw new AppError('Jadwal latihan tidak ditemukan.', 404);
    if (schedule.status !== 'active') throw new AppError('Jadwal latihan sudah tidak aktif.', 400);

    // Insert exercise log
    const { data: log, error } = await supabase
      .from('exercise_logs')
      .insert([{
        schedule_id: scheduleId,
        duration_seconds: data.durationSeconds,
        session_number: data.sessionNumber ?? null,
        pain_level: data.painLevel ?? null,
      }])
      .select()
      .single();

    if (error) throw new AppError('Gagal menyimpan log latihan: ' + error.message, 500);

    // Update gamification_stats: increment completed_exercises
    await supabase.rpc('increment_completed_exercises', { p_patient_id: schedule.patient_id })
      .then(() => { }) // Non-blocking — fails silently if RPC not set up yet
      .catch(() => { });

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
    // 1. Fetch the most recent active program for this patient
    const { data: activePrograms } = await supabase
      .from('patient_programs')
      .select('id, doctor_id, status')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(1);

    let schedule = activePrograms?.[0];

    // 2. Fallback: If no program exists, create a fresh ACTIVE program
    if (!schedule) {
      const { data: patient } = await supabase
        .from('patient')
        .select('doctor_id')
        .eq('id', patientId)
        .single();
        
      let doctorId = patient?.doctor_id;
      if (!doctorId) {
        const { data: fallbackDoctor } = await supabase.from('doctor').select('id').limit(1).single();
        if (fallbackDoctor) {
          doctorId = fallbackDoctor.id;
          await supabase.from('patient').update({ doctor_id: doctorId }).eq('id', patientId);
        }
      }

      if (!doctorId) throw new AppError('Tidak ada dokter di sistem untuk di-assign ke program ini.', 400);

      const { data: newProgram, error: nsError } = await supabase
        .from('patient_programs')
        .insert([{
          patient_id: patientId,
          doctor_id: doctorId,
          status: 'Active',
          start_date: new Date().toISOString()
        }])
        .select('id')
        .single();

      if (nsError) throw new AppError('Gagal membuat jadwal latihan: ' + nsError.message, 500);
      schedule = newProgram;
    }

    // 3. Derive running session number for this program
    const { count: totalLogs } = await supabase
      .from('exercise_logs')
      .select('id', { count: 'exact', head: true })
      .eq('schedule_id', schedule.id);

    const sessionNumber = (totalLogs ?? 0) + 1;

    // 4. Insert the exercise log attached to the ACTIVE program
    const { data: log, error } = await supabase
      .from('exercise_logs')
      .insert([{
        schedule_id: schedule.id,
        duration_seconds: data.durationSeconds ?? 0,
        session_number:   data.sessionNumber ?? sessionNumber,
        pain_level:       data.painLevel ?? null,
        notes:            data.notes ?? null
      }])
      .select()
      .single();

    if (error) throw new AppError('Gagal menyimpan sesi latihan: ' + error.message, 500);

    // Best-effort: update gamification_stats
    await supabase.rpc('increment_completed_exercises', { p_patient_id: patientId })
      .then(() => { })
      .catch(() => { });

    return log;
  },

  /**
   * Get exercise history for the logged-in patient (via patient_programs join).
   *
   * @param {string} patientId  — patient.id (table PK, NOT user_id)
   */
  async getPatientExerciseLogs(patientId, { page, limit }) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Step 1: Get all program IDs for this patient
    const { data: programs } = await supabase
      .from('patient_programs')
      .select('id')
      .eq('patient_id', patientId);

    const programIds = (programs ?? []).map(p => p.id);
    if (programIds.length === 0) return { data: [], total: 0 };

    // Step 2: Get exercise logs for those programs
    const { data, error, count } = await supabase
      .from('exercise_logs')
      .select('id, duration_seconds, session_number, pain_level, created_at, schedule_id', { count: 'exact' })
      .in('schedule_id', programIds)
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
    const to = from + limit - 1;

    let programIds = null;
    if (patientId) {
      const { data: programs } = await supabase
        .from('patient_programs')
        .select('id')
        .eq('patient_id', patientId);
      programIds = (programs ?? []).map(p => p.id);
      if (programIds.length === 0) return { data: [], total: 0 };
    }

    let query = supabase
      .from('exercise_logs')
      .select('id, duration_seconds, session_number, pain_level, created_at, schedule_id', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (programIds) {
      query = query.in('schedule_id', programIds);
    }

    const { data, error, count } = await query;
    if (error) throw new AppError('Gagal mengambil semua log latihan: ' + error.message, 500);
    return { data: data ?? [], total: count ?? 0 };
  },

  async getMonthlyGoal(userId) {
    console.log(`\n=== 🔍 DEBUG START: getMonthlyGoal buat User ID: ${userId} ===`);

    // 1. Dapetin tanggal 1 dan tanggal terakhir bulan ini
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    const firstDay = `${year}-${month}-01`;
    const lastDayObj = new Date(year, date.getMonth() + 1, 0);
    const lastDay = `${year}-${month}-${String(lastDayObj.getDate()).padStart(2, '0')}`;

    console.log(`[Step 1] Range Bulan Ini: First Day -> ${firstDay} | Last Day -> ${lastDay}`);

    // 2. Cari ID pasien
    const { data: patient, error: patientErr } = await supabase
      .from('patient')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (patientErr || !patient) {
      console.log(`[Step 2] ❌ Gagal dapet data pasien atau error:`, patientErr?.message || "Data kosong");
      console.log(`=== 🛑 DEBUG END (Return 0) ===\n`);
      return 0; // Return 0 kalo ga ketemu pasien
    }

    console.log(`[Step 2] ✅ Ketemu Patient ID: ${patient.id}`);

    // 3. Cari program yang AKTIF aja
    const { data: activeProgram, error: progErr } = await supabase
      .from('patient_programs')
      .select('id')
      .eq('patient_id', patient.id)
      .eq('status', 'active') // Wajib filter ini biar ga narik history program lama
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (progErr || !activeProgram) {
      console.log(`[Step 3] ❌ Gagal dapet program aktif atau error:`, progErr?.message || "Data kosong");
      console.log(`=== 🛑 DEBUG END (Return 0) ===\n`);
      return 0; // Return 0 kalo pasien ga punya program aktif
    }

    console.log(`[Step 3] ✅ Ketemu Program ID Aktif: ${activeProgram.id}`);

    // 4. Tarik target mingguan berdasarkan week_start_date (Anti Double-Count)
    const { data: weeklyTargets, error: targetErr } = await supabase
      .from('weekly_schedule')
      .select('target_sessions, week_start_date, week_end_date')
      .eq('program_id', activeProgram.id)
      .gte('week_start_date', firstDay)
      .lte('week_start_date', lastDay);

    if (targetErr || !weeklyTargets || weeklyTargets.length === 0) {
      console.log(`[Step 4] ⚠️ Gagal fetch weekly_schedule atau jadwal kosong bulan ini. Error:`, targetErr?.message || "No data");
      console.log(`=== 🛑 DEBUG END (Return 0) ===\n`);
      return 0; // Return 0 kalo dokter belum bikin jadwal bulan ini
    }

    console.log(`[Step 4] ✅ Ketemu ${weeklyTargets.length} record mingguan! Detailnya:`, weeklyTargets);

    // 5. Jumlahin semua target_sessions buat dapet Total Bulanan
    const totalMonthlyGoal = weeklyTargets.reduce((sum, week) => sum + (week.target_sessions || 0), 0);

    console.log(`[Step 5] 🎯 Hasil Reduce Total Goal Bulanan: ${totalMonthlyGoal}`);
    console.log(`=== 🏁 DEBUG END ===\n`);

    return totalMonthlyGoal;
  },
  /**
   * Get a single exercise log by ID.
   */
  async getExerciseLogById(logId) {
    const { data, error } = await supabase
      .from('exercise_logs')
      .select('id, duration_seconds, session_number, pain_level, created_at, schedule_id')
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
        patient_id: patientId,
        minigame_id: data.minigameId ?? null,
        score: data.score,
        duration_seconds: data.durationSeconds,
        max_combo: data.maxCombo ?? 0,
        played_at: new Date().toISOString(),
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
    const to = from + limit - 1;

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
    // 1. Get gamification stats (for total score, etc)
    const { data: stats } = await supabase
      .from('gamification_stats')
      .select('total_scheduled_exercises, completed_exercises, total_minigame_score')
      .eq('patient_id', patientId)
      .maybeSingle();

    // 2. Fetch doctor name
    const { data: patientData } = await supabase
      .from('patient')
      .select('doctor:doctor_id(name)')
      .eq('id', patientId)
      .maybeSingle();
    const doctorName = patientData?.doctor?.name || null;

    // 3. Compute Streak dynamically from minigame_logs and exercise_logs
    const { data: minigames } = await supabase
      .from('minigame_logs')
      .select('played_at, score, max_combo, duration_seconds')
      .eq('patient_id', patientId)
      .order('played_at', { ascending: false });

    // Last 7 minigame sessions for score trend (from the fetched minigames)
    const trend = (minigames || []).slice(0, 7);

    // Get exercise logs
    const { data: programs } = await supabase
      .from('patient_programs')
      .select('id')
      .eq('patient_id', patientId);

    let allExerciseLogs = [];
    if (programs && programs.length > 0) {
      const pIds = programs.map(p => p.id);
      const { data: logs } = await supabase
        .from('exercise_logs')
        .select('created_at, duration_seconds, pain_level')
        .in('schedule_id', pIds)
        .order('created_at', { ascending: false });
      allExerciseLogs = logs || [];
    }

    const exerciseTrend = allExerciseLogs.slice(0, 7).reverse();

    // Compute Streak Logic
    const allDates = new Set();

    const getLocalDateStr = (isoString) => {
      const d = new Date(isoString);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    // Include minigames with duration >= 60s
    (minigames || []).filter(m => m.duration_seconds >= 60 && m.played_at).forEach(m => allDates.add(getLocalDateStr(m.played_at)));
    // Include exercises with duration >= 60s
    (allExerciseLogs || []).filter(e => e.duration_seconds >= 60 && e.created_at).forEach(e => allDates.add(getLocalDateStr(e.created_at)));

    const sortedDates = Array.from(allDates).sort();

    let currentStreak = 0;
    let highestStreak = 0;
    let freezeAvailable = true;
    let lastFreezeUseDate = null;
    let lastDate = null;

    for (const dStr of sortedDates) {
      const dateObj = new Date(dStr + 'T00:00:00'); // local midnight assumption

      if (!lastDate) {
        currentStreak = 1;
        highestStreak = 1;
        lastDate = dateObj;
        continue;
      }

      // Check if freeze shield is reset (7 days since last use)
      if (!freezeAvailable && lastFreezeUseDate) {
        const daysSinceFreeze = Math.floor((dateObj - lastFreezeUseDate) / (1000 * 60 * 60 * 24));
        if (daysSinceFreeze >= 7) {
          freezeAvailable = true;
          lastFreezeUseDate = null;
        }
      }

      const diffDays = Math.round((dateObj - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
        lastDate = dateObj;
      } else if (diffDays === 2 && freezeAvailable) {
        // use freeze shield for the skipped day
        freezeAvailable = false;
        lastFreezeUseDate = new Date(lastDate.getTime() + 86400000); // the day that was skipped
        currentStreak++;
        lastDate = dateObj;
      } else if (diffDays > 1) {
        currentStreak = 1;
        lastDate = dateObj;
      }

      if (currentStreak > highestStreak) highestStreak = currentStreak;
    }

    // Check if streak is broken as of today
    if (lastDate) {
      // We use current server date, midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const last = new Date(lastDate);
      last.setHours(0, 0, 0, 0);

      const diffDays = Math.round((today - last) / (1000 * 60 * 60 * 24));

      if (diffDays === 2 && freezeAvailable) {
        // active but in danger (needs a session today to use freeze shield)
        // streak continues, but we don't reset it
      } else if (diffDays > 1) {
        currentStreak = 0;
      }
    }

    return {
      gamification: {
        total_scheduled_exercises: stats?.total_scheduled_exercises || 0,
        completed_exercises: stats?.completed_exercises || allExerciseLogs.length,
        total_minigame_score: stats?.total_minigame_score || 0,
        current_streak: currentStreak,
        highest_streak: highestStreak,
        doctor_name: doctorName,
        freeze_available: freezeAvailable ? 1 : 0,
        last_completed_date: lastDate ? lastDate.toISOString().split('T')[0] : null
      },
      minigameTrend: trend.reverse(),
      exerciseTrend,
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
        .select('*')
        .eq('patient_id', patientId)
        .maybeSingle();

      const totalScore = existing ? (existing.total_minigame_score || 0) + newScore : newScore;

      if (existing) {
        await supabase
          .from('gamification_stats')
          .update({
            total_minigame_score: totalScore,
            updated_at: new Date().toISOString(),
          })
          .eq('patient_id', patientId);
      } else {
        await supabase
          .from('gamification_stats')
          .insert([{
            patient_id: patientId,
            total_minigame_score: totalScore,
            updated_at: new Date().toISOString(),
          }]);
      }
    } catch (e) {
      console.error('Failed to update gamification stats:', e);
    }
  }
};


module.exports = sessionService;
