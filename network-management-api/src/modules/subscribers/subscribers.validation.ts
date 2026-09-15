import { z } from "zod";

// export const createSubscriberSchema = z.object({
//   fullName: z.string().min(1, "Full name required"),
//   facilityType: z.string().nullable().optional(),
//   phone: z.string().nullable().optional(),
//   package: z.string().nullable().optional(),
//   monthlyPrice: z.string().or(z.number()).optional().default("0"),
//   speed: z.number().int().optional().default(4),
//   startDate: z.string().nullable().optional(),
//   firstContactDate: z.string().nullable().optional(),
//   disconnectionDate: z.string().nullable().optional(),
//   isSuspended: z.boolean().optional().default(false),
//   notes: z.string().nullable().optional(),
// });// lineId

export const updateSubscriberSchema = z.object({
  fullName: z.string().nullable().optional(),
  facilityType: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  password: z.string().nullable().optional(),
  monthlyPrice: z.string().or(z.number()).optional(),
  isSuspended: z.boolean().optional(),
  isPaused: z.boolean().optional(),
  notes: z.string().nullable().optional(),
  routerPort: z.string().nullable().optional(),
});

export const assignUsernameSchema = z.object({
  changeCause: z.string().nullable().optional(),
});

// export type CreateSubscriberInput = z.infer<typeof createSubscriberSchema>;
export type UpdateSubscriberInput = z.infer<typeof updateSubscriberSchema>;
