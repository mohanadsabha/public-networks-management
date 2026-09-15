import { Request, Response } from "express";
import { sendSuccess, sendFailed } from "../../utils/responses.util";
import * as invoiceService from "./invoices.service";
import { ActivityMeta } from "../../middleware/logger.middleware";

export const getSubscriberInvoices = async (req: Request, res: Response) => {
  const { subscriberId } = req.params;
  const invoices = await invoiceService.getSubscriberInvoices(Number(subscriberId));
  return sendSuccess(res, invoices);
};

export const listAllInvoices = async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const result = await invoiceService.listAllInvoices({ page, limit, search });
  return sendSuccess(res, result);
};

export const createInvoice = async (req: Request, res: Response) => {
  const { subscriberId } = req.params;
  const { amount, paidAmount, paymentMethod, notes } = req.body;

  if (!paymentMethod) {
    return sendFailed(res, "Payment method is required", 400);
  }
  if (!["cash", "bank_transfer", "credit"].includes(paymentMethod)) {
    return sendFailed(res, "Invalid payment method", 400);
  }

  const payment = Number(paidAmount);
  if (!Number.isFinite(payment) || isNaN(Number(amount))) {
    return sendFailed(res, "Payment amount must be a number", 400);
  }

  const result = await invoiceService.createInvoice(
    Number(subscriberId),
    req.user.userId,
    amount,
    paidAmount,
    paymentMethod,
    notes
  );
  res.locals.activityMeta = {
    subjectType: "Invoice",
    subjectId: result.subscriberId,
    subjectName: `Invoice #${result.id}`,
  } satisfies ActivityMeta;
  return sendSuccess(res, result, "Invoice created successfully", 201);
};

export const deleteInvoice = async (req: Request, res: Response) => {
  const { subscriberId, invoiceId } = req.params;
  await invoiceService.deleteInvoice(Number(invoiceId));
  res.locals.activityMeta = {
    subjectType: "Invoice",
    subjectId: Number(subscriberId),
    subjectName: `Invoice #${invoiceId}`,
  } satisfies ActivityMeta;
  return sendSuccess(res, {}, "Invoice deleted successfully");
};
