const patientService = require('../services/patient.service');
const { parsePagination } = require('../utils/pagination');

/**
 * PatientController — Handles HTTP layer for patient management & therapist notes.
 */
const patientController = {
  /**
   * POST /api/v1/patients/register — Doctor: Register new patient
   */
  async registerPatient(req, res, next) {
    try {
      const { name, email, password, condition, notes } = req.body;
      const data = await patientService.registerPatient({
        name,
        email,
        password,
        condition,
        notes,
        doctorUserId: req.user?.id,
      });

      return res.status(201).json({
        success: true,
        message: 'Pasien baru berhasil didaftarkan.',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/patients/:id/notes — Doctor: Update therapist notes & assessment
   */
  async updateNotes(req, res, next) {
    try {
      const { id } = req.params;
      const { notes, text } = req.body;
      const notesText = notes || text || '';
      const data = await patientService.updateTherapistNotes(id, notesText);

      return res.json({
        success: true,
        message: 'Catatan terapis berhasil diperbarui.',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/patients/:id/feedback-logs — Doctor: Get patient exercise feedback logs
   */
  async getFeedbackLogs(req, res, next) {
    try {
      const { id } = req.params;
      const data = await patientService.getPatientFeedbackLogs(id);

      return res.json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/patients — Doctor: list all their patients.
   */
  async listAll(req, res, next) {
    try {
      const { page, limit } = parsePagination(req.query);
      const search = req.query.search;

      const { supabase } = require('../config/supabase');
      const { data: doctor } = await supabase
        .from('doctor')
        .select('id')
        .eq('user_id', req.user?.id)
        .single();

      const { data, total } = await patientService.listAll({
        page, limit, search, doctorId: doctor?.id,
      });
      return res.paginate({ message: 'Patients retrieved.', data, page, limit, total });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/patients/me — Patient: get own profile.
   */
  async getMyProfile(req, res, next) {
    try {
      const profile = await patientService.getMyProfile(req.user.id);
      return res.ok({ message: 'Profile retrieved.', data: profile });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/patients/:id — Doctor: get specific patient.
   */
  async getById(req, res, next) {
    try {
      const patient = await patientService.getById(req.params.id);
      return res.ok({ message: 'Patient retrieved.', data: patient });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/v1/patients/me — Patient: update own profile.
   */
  async updateMyProfile(req, res, next) {
    try {
      const updated = await patientService.updateProfile(req.user.id, req.body);
      return res.ok({ message: 'Profile updated.', data: updated });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = patientController;
