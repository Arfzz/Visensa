const { z } = require('zod');

/**
 * Validation schemas aligned to actual DB schema:
 *
 * exercise_logs: schedule_id, duration_seconds, max_angle, pain_level
 * minigame_logs: schedule_id (optional), score, duration_seconds, max_combo
 */

// POST /api/v1/sessions/exercise
const logExerciseSchema = z.object({
  scheduleId:      z.string().uuid('scheduleId harus berupa UUID valid'),
  durationSeconds: z.number().int().positive('Duration harus berupa integer positif'),
  maxAngle:        z.number().min(0).max(360).optional(),
  painLevel:       z.number().int().min(0).max(10).optional(),
});

// POST /api/v1/sessions/minigame
const logMinigameSchema = z.object({
  scheduleId:      z.string().uuid().optional(),
  score:           z.number().int().min(0),
  durationSeconds: z.number().int().positive(),
  maxCombo:        z.number().int().min(0).optional(),
});

// Query params for list endpoints
const listSessionSchema = z.object({
  page:      z.string().regex(/^\d+$/).optional(),
  limit:     z.string().regex(/^\d+$/).optional(),
  patientId: z.string().uuid().optional(),
});

module.exports = { logExerciseSchema, logMinigameSchema, listSessionSchema };
