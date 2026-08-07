const { z } = require('zod');

const updatePatientProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  medicalNotes: z.string().max(1000).optional(),
  phone: z.string().max(20).optional(),
});

const listPatientsSchema = z.object({
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  search: z.string().max(100).optional(),
});

const registerPatientSchema = z.object({
  name: z.string().min(2, 'Nama pasien wajib diisi'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6).optional(),
  condition: z.string().min(2, 'Diagnosis / kondisi medis wajib diisi'),
  notes: z.string().optional(),
});

module.exports = { updatePatientProfileSchema, listPatientsSchema, registerPatientSchema };
