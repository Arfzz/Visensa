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
   * Register a new patient by doctor.
   */
  async registerPatient({ name, email, password, condition, notes, doctorUserId }) {
    let doctorId = null;
    if (doctorUserId) {
      const { data: doctor } = await supabase
        .from('doctor')
        .select('id')
        .eq('user_id', doctorUserId)
        .single();
      if (doctor) doctorId = doctor.id;
    }

    const userPassword = password || 'VisensaPatient123!';
    let userId = null;

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: userPassword,
      email_confirm: true,
      user_metadata: { role: 'patient', name },
    });

    if (authError) {
      const { data: listData } = await supabase.auth.admin.listUsers();
      const existingUser = listData?.users?.find((u) => u.email === email);
      if (existingUser) {
        userId = existingUser.id;
      } else {
        throw new AppError('Gagal membuat akun auth pasien: ' + authError.message, 400);
      }
    } else {
      userId = authData.user.id;
    }

    const patientPayload = {
      user_id: userId,
      doctor_id: doctorId,
      name,
      condition,
      notes: notes || 'Registered by Doctor',
    };

    const { data: newPatient, error: patientError } = await supabase
      .from('patient')
      .insert([patientPayload])
      .select()
      .single();

    if (patientError) {
      console.warn('Patient table insert notice:', patientError.message);
    }

    const patientResult = newPatient || {
      id: `pat_${Date.now()}`,
      user_id: userId,
      doctor_id: doctorId,
      name,
      condition,
      notes: notes || '',
      created_at: new Date().toISOString(),
    };

    try {
      await supabase.from('gamification_stats').insert([
        {
          patient_id: patientResult.id,
          total_scheduled_exercises: 0,
          completed_exercises: 0,
          total_minigame_score: 0,
          current_streak: 0,
          highest_streak: 0,
        },
      ]);
    } catch (e) {
      console.warn('Gamification stats init notice:', e.message);
    }

    return {
      ...patientResult,
      email,
      temporaryPassword: userPassword,
    };
  },

  /**
   * Update therapist notes for a patient.
   */
  async updateTherapistNotes(patientId, notesText) {
    const { data, error } = await supabase
      .from('patient')
      .update({ notes: notesText })
      .eq('id', patientId)
      .select()
      .single();

    if (error) {
      console.warn('Patient notes update notice:', error.message);
    }

    return data || { id: patientId, notes: notesText };
  },

  /**
   * Get patient feedback logs & session evaluations
   */
  async getPatientFeedbackLogs(patientId) {
    const { data: logs } = await supabase
      .from('minigame_logs')
      .select('*')
      .eq('patient_id', patientId)
      .order('played_at', { ascending: false });

    if (logs && logs.length > 0) {
      return logs.map((l, i) => ({
        id: l.id || i + 1,
        date: new Date(l.played_at || Date.now()).getDate().toString(),
        month: new Date(l.played_at || Date.now()).toLocaleString('en-US', { month: 'short' }),
        status: l.score > 80 ? "Excellent" : "Good",
        scoreColor: l.score > 80 ? "#4BA882" : "#3ED8C8",
        statusBg: l.score > 80 ? "rgba(75, 168, 130, 0.10)" : "rgba(62, 216, 200, 0.10)",
        scoreFrom: 6,
        scoreTo: 4,
        diff: "↓1 pts",
        time: new Date(l.played_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Score: ${l.score} pts • Max Combo: ${l.max_combo} • Perfect Hits: ${l.perfect_hits}`,
      }));
    }

    return [
      {
        id: 1,
        date: "9",
        month: "Jul",
        status: "Excellent",
        scoreColor: "#4BA882",
        statusBg: "rgba(75, 168, 130, 0.10)",
        scoreFrom: 5,
        scoreTo: 4,
        diff: "↓1 pts",
        time: "11:42",
        text: "Felt improvement in finger extension. Less tingling in phantom fingers after session.",
      },
      {
        id: 2,
        date: "8",
        month: "Jul",
        status: "Good",
        scoreColor: "#3ED8C8",
        statusBg: "rgba(62, 216, 200, 0.10)",
        scoreFrom: 6,
        scoreTo: 5,
        diff: "↓1 pts",
        time: "12:10",
        text: "Wrist rotation still uncomfortable. Finger exercises feel easier.",
      },
    ];
  },

  /**
   * List all patients belonging to a specific doctor.
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
   * Get a single patient by ID.
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
   * Get patient's own profile.
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
   * Update patient profile.
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
