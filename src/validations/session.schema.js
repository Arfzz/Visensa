const { z } = require('zod');

const createSessionSchema = z.object({
  exerciseId: z.string().uuid('Invalid exercise ID'),
  durationSeconds: z.number().int().positive('Duration must be a positive integer'),
  repsCompleted: z.number().int().min(0).optional(),
  notes: z.string().max(500).optional(),
});

const listSessionSchema = z.object({
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  patientId: z.string().uuid().optional(),
});

module.exports = { createSessionSchema, listSessionSchema };
