const { z } = require('zod');

const createProgramSchema = z.object({
  patient_id: z.string().optional(),
  patientId: z.string().optional(),
  doctor_id: z.string().optional(),
  program_duration_weeks: z.number().int().min(1).max(52).optional(),
  programDurationWeeks: z.number().int().min(1).max(52).optional(),
  frequency_per_week: z.number().int().min(1).max(7).optional(),
  frequencyPerWeek: z.number().int().min(1).max(7).optional(),
  rest_interval_days: z.number().int().min(0).max(6).optional(),
  restIntervalDays: z.number().int().min(0).max(6).optional(),
  start_date: z.string().optional(),
  startDate: z.string().optional(),
  notes: z.string().optional(),
  pain_level: z.number().int().min(1).max(10).optional(),
});

const extendProgramSchema = z.object({
  additional_weeks: z.number().int().min(1).max(52).optional(),
  additionalWeeks: z.number().int().min(1).max(52).optional(),
});

module.exports = { createProgramSchema, extendProgramSchema };
