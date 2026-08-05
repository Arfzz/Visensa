const AppError = require('../utils/AppError');
const { supabase } = require('../config/supabase');

const formatYearMonthDay = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getTomorrowDateString = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return formatYearMonthDay(date);
};

const addDaysToDateString = (dateStr, days) => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return formatYearMonthDay(date);
};

const programService = {
  /**
   * Get active program & weekly schedules for a patient
   */
  async getActiveProgramByPatientId(patientId) {
    // 1. Fetch active patient_programs
    const { data: program, error: progError } = await supabase
      .from('patient_programs')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (progError && progError.code !== 'PGRST116') {
      console.warn('Program fetch notice:', progError.message);
    }

    if (!program) {
      return null;
    }

    // 2. Fetch weekly_schedule for this program
    const { data: schedules, error: schedError } = await supabase
      .from('weekly_schedule')
      .select('*')
      .eq('program_id', program.id)
      .order('week_start_date', { ascending: true });

    if (schedError) {
      console.warn('Weekly schedule fetch notice:', schedError.message);
    }

    return {
      ...program,
      weekly_schedules: schedules ?? [],
    };
  },

  /**
   * Create a new therapy program & generate weekly schedules
   */
  async createProgram({
    patient_id,
    doctor_id,
    program_duration_weeks = 4,
    frequency_per_week = 3,
    rest_interval_days = 1,
    start_date,
    notes,
    pain_level = 4,
  }) {
    const startDate = start_date || getTomorrowDateString();
    const totalDays = Number(program_duration_weeks) * 7;
    const endDate = addDaysToDateString(startDate, totalDays - 1);

    // 1. Insert into patient_programs
    const programPayload = {
      patient_id,
      doctor_id: doctor_id || null,
      status: 'active',
      start_date: startDate,
      end_date: endDate,
      pain_level: Number(pain_level),
      session_number: 1,
      notes: notes || `Program Terapi ${program_duration_weeks} Minggu`,
    };

    const { data: newProgram, error: progError } = await supabase
      .from('patient_programs')
      .insert([programPayload])
      .select()
      .single();

    if (progError) {
      throw new AppError('Gagal membuat program terapi: ' + progError.message, 500);
    }

    // 2. Generate weekly_schedule records
    const weeklySchedulesPayload = [];
    let currentWeekStart = startDate;

    for (let w = 1; w <= Number(program_duration_weeks); w++) {
      const currentWeekEnd = addDaysToDateString(currentWeekStart, 6);
      weeklySchedulesPayload.push({
        program_id: newProgram.id,
        week_start_date: currentWeekStart,
        week_end_date: currentWeekEnd,
        target_sessions: Number(frequency_per_week),
        completed_sessions: 0,
        pain_level_eval: Number(pain_level),
        notes: `Jadwal Minggu ${w}`,
        status: 'in_progress',
      });
      currentWeekStart = addDaysToDateString(currentWeekEnd, 1);
    }

    const { data: createdSchedules, error: schedError } = await supabase
      .from('weekly_schedule')
      .insert(weeklySchedulesPayload)
      .select();

    if (schedError) {
      console.warn('Gagal insert weekly_schedule:', schedError.message);
    }

    return {
      ...newProgram,
      weekly_schedules: createdSchedules ?? weeklySchedulesPayload,
    };
  },

  /**
   * Extend program by N weeks (Quick Extend)
   */
  async extendProgram(programId, additionalWeeks = 4) {
    // 1. Fetch original program
    const { data: origProgram, error: fetchError } = await supabase
      .from('patient_programs')
      .select('*')
      .eq('id', programId)
      .single();

    if (fetchError || !origProgram) {
      throw new AppError('Program terapi tidak ditemukan.', 404);
    }

    // 2. Mark previous program status as review_required / completed
    await supabase
      .from('patient_programs')
      .update({ status: 'completed' })
      .eq('id', programId);

    // 3. Create extended new program
    const nextStartDate = addDaysToDateString(origProgram.end_date, 1);

    return this.createProgram({
      patient_id: origProgram.patient_id,
      doctor_id: origProgram.doctor_id,
      program_duration_weeks: additionalWeeks,
      frequency_per_week: 3,
      rest_interval_days: 1,
      start_date: nextStartDate,
      notes: `Perpanjangan Protocol (${additionalWeeks} Minggu)`,
      pain_level: origProgram.pain_level || 4,
    });
  },

  /**
   * Reassign/Update program parameters
   */
  async reassignProgram(programId, params) {
    const { data: origProgram, error: fetchError } = await supabase
      .from('patient_programs')
      .select('*')
      .eq('id', programId)
      .single();

    if (!fetchError && origProgram) {
      await supabase
        .from('patient_programs')
        .update({ status: 'completed' })
        .eq('id', programId);
    }

    return this.createProgram({
      patient_id: origProgram ? origProgram.patient_id : params.patient_id,
      doctor_id: origProgram ? origProgram.doctor_id : params.doctor_id,
      program_duration_weeks: params.program_duration_weeks || 4,
      frequency_per_week: params.frequency_per_week || 3,
      rest_interval_days: params.rest_interval_days || 1,
      start_date: params.start_date || getTomorrowDateString(),
      notes: params.notes || 'Reassigned Protocol',
      pain_level: params.pain_level || 4,
    });
  },
};

module.exports = programService;
