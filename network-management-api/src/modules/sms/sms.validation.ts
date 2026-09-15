import { z } from "zod";

export const smsAudienceSchema = z.enum([
  "all",
  "customers",
  "expires1Day",
  "expires2Days",
  "expiresSoon",
  "expired",
  "stopped",
  "withDebt",
]);

export const sendSmsSchema = z
  .object({
    recipientType: z.enum(["subscribers", "custom"]),
    message: z.string().trim().min(1, "Message is required").max(320, "Message too long"),
    subscriberIds: z.array(z.number().int().positive()).optional(),
    phone: z.string().trim().optional(),
    phones: z.array(z.string().trim()).optional(),
    templateId: z.number().int().positive().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.recipientType === "custom") {
      const phone = data.phone?.trim();
      if (!phone) {
        ctx.addIssue({ code: "custom", message: "Phone is required", path: ["phone"] });
      }
      return;
    }

    const ids = data.subscriberIds ?? [];
    const phones = (data.phones ?? []).filter(Boolean);
    if (ids.length === 0 && phones.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Select at least one subscriber or provide phone numbers",
        path: ["subscriberIds"],
      });
    }
  });

export const createSmsTemplateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  body: z.string().trim().min(1, "Body is required").max(320, "Message too long"),
});

export const updateSmsTemplateSchema = createSmsTemplateSchema.partial().refine(
  (data) => data.name !== undefined || data.body !== undefined,
  { message: "At least one field is required" },
);

export const createSmsGroupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  description: z.string().trim().max(500).optional().nullable(),
  memberIds: z.array(z.number().int().positive()).min(1, "Select at least one member"),
});

export const updateSmsGroupSchema = createSmsGroupSchema;

export type SendSmsInput = z.infer<typeof sendSmsSchema>;
export type SmsAudienceFilter = z.infer<typeof smsAudienceSchema>;
export type CreateSmsTemplateInput = z.infer<typeof createSmsTemplateSchema>;
export type UpdateSmsTemplateInput = z.infer<typeof updateSmsTemplateSchema>;
export type CreateSmsGroupInput = z.infer<typeof createSmsGroupSchema>;
export type UpdateSmsGroupInput = z.infer<typeof updateSmsGroupSchema>;
