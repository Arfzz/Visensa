const patientService = require('../services/patient.service');
const { parsePagination } = require('../utils/pagination');

/**
 * PatientController — Handles HTTP layer for patient management.
 */
const patientController = {
  /**
   * GET /api/v1/patients — Doctor: list all their patients.
   */
  async listAll(req, res, next) {
    try {
      const { page, limit } = parsePagination(req.query);
      const search = req.query.search;

      // Resolve doctor's own patient table id to filter patients
      const { supabase } = require('../config/supabase');
      const { data: doctor } = await supabase
        .from('doctor')
        .select('id')
        .eq('user_id', req.user.id)
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
