/**
 * GARBO — Operation Validation Schema
 */
import { z } from "zod";

const OPERATION_STATUSES = ["Pending", "Completed", "Delayed", "Missed"] as const;

export const updateOperationSchema = z.object({
  status: z.enum(OPERATION_STATUSES, {
    required_error: "Status is required",
  }),
  fuel_consumed_l: z
    .number({ invalid_type_error: "Enter a valid number" })
    .min(0, "Fuel cannot be negative")
    .max(10_000, "Fuel value seems too high")
    .nullable()
    .optional(),
  waste_volume_kg: z
    .number({ invalid_type_error: "Enter a valid number" })
    .min(0, "Waste volume cannot be negative")
    .max(100_000, "Waste volume seems too high")
    .nullable()
    .optional(),
  notes: z
    .string()
    .max(500, "Notes must be under 500 characters")
    .nullable()
    .optional(),
});

export type UpdateOperationSchema = z.infer<typeof updateOperationSchema>;