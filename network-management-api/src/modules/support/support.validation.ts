import { z } from "zod";

export type StringObject = Record<string, unknown>;

const ticketStatusSchema = z.enum(["open", "in_progress", "waiting_customer", "resolved"]);
const ticketPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);
const ticketChannelSchema = z.enum(["phone", "visit", "whatsapp", "other"]);

export const createSupportTicketSchema = z.object({
  title: z.string().min(1, "title is required").max(500),
  description: z.string().min(1, "description is required"),
  status: ticketStatusSchema.default("open"),
  priority: ticketPrioritySchema.default("medium"),
  channel: ticketChannelSchema.default("phone"),
  subscriberName: z.string().min(1, "subscriberName is required").max(200),
  subscriberPhone: z.string().min(1, "subscriberPhone is required").max(50),
  assignedTo: z.string().max(200).optional(),
});

export const updateSupportTicketSchema = createSupportTicketSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field is required" },
);

export type CreateSupportTicketInput = z.infer<typeof createSupportTicketSchema>;
export type UpdateSupportTicketInput = z.infer<typeof updateSupportTicketSchema>;
