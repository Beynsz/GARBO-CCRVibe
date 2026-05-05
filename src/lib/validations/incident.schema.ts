/**
 * GARBO — Incident Validation Schema
 */
import { z } from "zod";

const INCIDENT_TYPES = [
  "Missed Collection",
  "Illegal Dumping",
  "Vehicle Breakdown",
  "Other",
] as const;

export const incidentSchema = z.object({
  sitio_id: z
    .string()
    .uuid("Please select a valid Sitio")
    .min(1, "Sitio is required"),
  operation_id: z.string().uuid().nullable().optional(),
  incident_type: z.enum(INCIDENT_TYPES, {
    required_error: "Incident type is required",
  }),
  reason_tag: z
    .string()
    .min(1, "Reason is required")
    .max(100, "Reason must be under 100 characters"),
  location_description: z
    .string()
    .max(300, "Location description must be under 300 characters")
    .nullable()
    .optional(),
  incident_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});

export type IncidentSchema = z.infer<typeof incidentSchema>;