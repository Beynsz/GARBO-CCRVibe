/**
 * GARBO — Schedule Validation Schema
 */
import { z } from "zod";
import { DAYS_OF_WEEK } from "@/types/app.types";

export const scheduleSchema = z.object({
  sitio_id: z
    .string()
    .uuid("Please select a valid Sitio")
    .min(1, "Sitio is required"),
  route_name: z
    .string()
    .min(2, "Route name must be at least 2 characters")
    .max(100, "Route name must be under 100 characters")
    .trim(),
  collection_days: z
    .array(z.enum(DAYS_OF_WEEK as [string, ...string[]]))
    .min(1, "Select at least one collection day"),
  frequency: z
    .string()
    .min(1, "Frequency is required")
    .default("Weekly"),
  is_active: z.boolean().default(true),
});

export type ScheduleSchema = z.infer<typeof scheduleSchema>;