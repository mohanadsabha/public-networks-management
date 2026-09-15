import { z } from "zod";

export const createCustomerSchema = z.object({
  fullName: z.string().min(1, "Full name required"),
  facilityType: z.string().min(1, "Facility type required"),
  phone: z.string().min(1, "Phone required"),
  lineId: z.string().min(1, "Line ID required"),
  monthlyPrice: z.string().or(z.number()).optional(),
  balance: z.string().or(z.number()).optional(),
  notes: z.string().nullable().optional(),
});

export const updateCustomerSchema = z.object({
  fullName: z.string().nullable().optional(),
  facilityType: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  lineId: z.string().min(1).optional(),
  monthlyPrice: z.string().or(z.number()).optional(),
  notes: z.string().nullable().optional(),
});

export const bulkDeleteSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
