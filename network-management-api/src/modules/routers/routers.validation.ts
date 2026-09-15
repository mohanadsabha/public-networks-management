import { z } from "zod";

export const createRouterSchema = z.object({
  routerName: z.string().min(1, "Router name is required").max(100),
});

export const updateRouterSchema = z.object({
  routerName: z.string().min(1).max(100).optional(),
});

export const assignRouterSchema = z.object({
  subscriberId: z.number().int().positive("Subscriber ID must be a positive integer"),
  routerPort: z.string().optional().nullable(),
});

export const bulkDeleteSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1),
});

export type CreateRouterInput = z.infer<typeof createRouterSchema>;
export type UpdateRouterInput = z.infer<typeof updateRouterSchema>;
export type AssignRouterInput = z.infer<typeof assignRouterSchema>;
