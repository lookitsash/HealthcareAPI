const { z } = require('zod');

const PatientSchema = z.object({
  patient_id: z.string(),
  name: z.string(),
  age: z.coerce.string(),
  gender: z.enum(['M', 'F']),
  blood_pressure: z.coerce.string(),
  temperature: z.coerce.string(),
  visit_date: z.string(),
  diagnosis: z.string(),
  medications: z.string()
});

const PaginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  hasPrevious: z.boolean()
});

const MetadataSchema = z.object({
  timestamp: z.string(),
  version: z.string(),
  requestId: z.string()
});

const ApiResponseSchema = z.object({
  data: z.array(PatientSchema),
  pagination: PaginationSchema,
  metadata: MetadataSchema
});

module.exports = {
  PatientSchema,
  PaginationSchema,
  MetadataSchema,
  ApiResponseSchema
};
