const programService = require('../services/program.service');

const programController = {
  /**
   * GET /api/v1/programs/patient/:patientId
   * Get active program & weekly schedules for a specific patient
   */
  async getActiveProgram(req, res, next) {
    try {
      const { patientId } = req.params;
      const data = await programService.getActiveProgramByPatientId(patientId);
      res.json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/programs
   * Create & assign new therapy program
   */
  async createProgram(req, res, next) {
    try {
      const body = req.body;
      const patient_id = body.patient_id || body.patientId;
      const program_duration_weeks = body.program_duration_weeks || body.programDurationWeeks || 4;
      const frequency_per_week = body.frequency_per_week || body.frequencyPerWeek || 3;
      const rest_interval_days = body.rest_interval_days || body.restIntervalDays || 1;
      const start_date = body.start_date || body.startDate;

      const doctor_id = req.user?.profile?.id || req.user?.doctor_id || req.user?.id;

      const data = await programService.createProgram({
        patient_id,
        doctor_id,
        program_duration_weeks,
        frequency_per_week,
        rest_interval_days,
        start_date,
        notes: body.notes,
        pain_level: body.pain_level || body.painLevel,
      });

      res.status(201).json({
        success: true,
        message: 'Program terapi berhasil dibuat.',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/programs/:programId/extend
   * Quick extend program by N weeks
   */
  async extendProgram(req, res, next) {
    try {
      const { programId } = req.params;
      const { additional_weeks, additionalWeeks } = req.body;
      const weeks = additional_weeks || additionalWeeks || 4;

      const data = await programService.extendProgram(programId, weeks);
      res.json({
        success: true,
        message: `Program berhasil diperpanjang +${weeks} minggu.`,
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/v1/programs/:programId/reassign
   * Reassign/Update program configuration
   */
  async reassignProgram(req, res, next) {
    try {
      const { programId } = req.params;
      const body = req.body;
      const data = await programService.reassignProgram(programId, {
        program_duration_weeks: body.program_duration_weeks || body.programDurationWeeks,
        frequency_per_week: body.frequency_per_week || body.frequencyPerWeek,
        rest_interval_days: body.rest_interval_days || body.restIntervalDays,
        start_date: body.start_date || body.startDate,
        notes: body.notes,
        pain_level: body.pain_level || body.painLevel,
      });

      res.json({
        success: true,
        message: 'Program terapi berhasil diperbarui/re-assign.',
        data,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = programController;
