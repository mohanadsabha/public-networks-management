import { Request, Response } from "express";
import * as supportService from "./support.service";
import { zodValidation } from "../../utils/zod.util";
import AppError from "../../utils/appError";
import {
  createSupportTicketSchema,
  updateSupportTicketSchema,
  type StringObject,
  type CreateSupportTicketInput,
  type UpdateSupportTicketInput,
} from "./support.validation";
import type { SupportTicketStatus } from "./support.service";
import { ActivityMeta } from "../../middleware/logger.middleware";

const VALID_STATUSES: SupportTicketStatus[] = ["open", "in_progress", "waiting_customer", "resolved"];

export const listTickets = async (req: Request, res: Response) => {
  const statusParam = req.query.status as string | undefined;
  let status: SupportTicketStatus | undefined;

  if (statusParam) {
    if (!VALID_STATUSES.includes(statusParam as SupportTicketStatus)) {
      throw new AppError("Invalid status filter", 400);
    }
    status = statusParam as SupportTicketStatus;
  }

  const tickets = await supportService.listSupportTickets(status);
  return res.status(200).json({
    status: "success",
    data: tickets,
  });
};

export const createTicket = async (
  req: Request<StringObject, StringObject, CreateSupportTicketInput>,
  res: Response
) => {
  const body = zodValidation(createSupportTicketSchema, req.body);
  const ticket = await supportService.createSupportTicket({
    title: body.title,
    description: body.description,
    subscriberName: body.subscriberName,
    subscriberPhone: body.subscriberPhone,
    status: body.status ?? "open",
    priority: body.priority ?? "medium",
    channel: body.channel ?? "phone",
    assignedTo: body.assignedTo,
  });
  res.locals.activityMeta = {
    subjectType: "Support",
    subjectId: ticket.id,
    subjectName: ticket.title,
  } satisfies ActivityMeta;
  return res.status(201).json({
    status: "success",
    data: ticket,
    message: "Support ticket created",
  });
};

export const updateTicket = async (
  req: Request<StringObject, StringObject, UpdateSupportTicketInput>,
  res: Response
) => {
  const id = Number(req.params.id);
  const body = zodValidation(updateSupportTicketSchema, req.body);
  const ticket = await supportService.updateSupportTicket(id, body);

  if (!ticket) {
    throw new AppError("Support ticket not found", 404);
  }

  res.locals.activityMeta = {
    subjectType: "Support",
    subjectId: ticket.id,
    subjectName: ticket.title,
  } satisfies ActivityMeta;

  return res.status(200).json({
    status: "success",
    data: ticket,
    message: "Support ticket updated",
  });
};

export const deleteTicket = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const deleted = await supportService.deleteSupportTicket(id);

  if (!deleted) {
    throw new AppError("Support ticket not found", 404);
  }

  res.locals.activityMeta = {
    subjectType: "Support",
    subjectId: id,
    subjectName: `Support Ticket #${id}`,
  } satisfies ActivityMeta;

  return res.status(204).send();
};

export const deleteAllTickets = async (_req: Request, res: Response) => {
  const deleted = await supportService.deleteAllSupportTickets();
  res.locals.activityMeta = {
    subjectType: "Support",
    subjectName: "All Support Tickets",
  } satisfies ActivityMeta;
  return res.status(200).json({
    status: "success",
    message: `Deleted ${deleted} support ticket(s)`,
    data: { deleted },
  });
};
