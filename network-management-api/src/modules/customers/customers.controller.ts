import { Request, Response } from "express";
import * as customerService from "./customers.service";
import * as invoiceService from "../invoices/invoices.service";
import AppError from "../../utils/appError";
import { createCustomerSchema, updateCustomerSchema, bulkDeleteSchema } from "./customers.validation";
import type { CustomerKindFilter } from "./customers.service";
import { ActivityMeta } from "../../middleware/logger.middleware";
import { zodValidation } from "../../utils/zod.util";

class CustomersController {
  public getCustomers = async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 200;
    const search = req.query.search as string;
    const kind = (req.query.kind as CustomerKindFilter) || "all";
    const speedRaw = req.query.speed;
    const speed =
      speedRaw !== undefined && speedRaw !== "" && !Number.isNaN(Number(speedRaw)) ? Number(speedRaw) : undefined;

    const result = await customerService.getCustomers(page, limit, search, speed, kind);

    return res.status(200).json({
      success: true,
      data:
        req.user.role === "viewer"
          ? { ...result, data: result.data.map(({ password, ...rest }) => rest) }
          : result,
    });
  };

  public getCustomerProfile = async (req: Request, res: Response) => {
    const { id } = req.params;
    const customer = await customerService.getCustomerById(Number(id));
    if (!customer) throw new AppError("Customer not found", 404);
    const { password, ...customerWithoutPassword } = customer;
    const data = req.user.role === "viewer" ? customerWithoutPassword : customer;

    const profileData: Record<string, unknown> = { ...data };
    const invoices = await invoiceService.getSubscriberInvoices(Number(id));
    profileData.balance = customer.balance;
    profileData.invoices = invoices;
    return res.status(200).json({
      success: true,
      data: profileData,
    });
  };

  public createCustomer = async (req: Request, res: Response) => {
    const validated = zodValidation(createCustomerSchema, req.body);
    const customer = await customerService.createCustomer(validated);
    res.locals.activityMeta = {
      subjectType: "Customer",
      subjectId: customer.id,
      subjectName: customer.fullName,
    } satisfies ActivityMeta;

    return res.status(201).json({
      success: true,
      data: customer,
      message: "Customer created successfully",
    });
  };

  public updateCustomer = async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = zodValidation(updateCustomerSchema, req.body);
    const customer = await customerService.updateCustomer(Number(id), validated);
    res.locals.activityMeta = {
      subjectType: "Subscriber",
      subjectId: customer.id,
      subjectName: customer.fullName,
    } satisfies ActivityMeta;

    const { password, ...customerWithoutPassword } = customer;

    return res.status(200).json({
      success: true,
      data: req.user.role === "viewer" ? customerWithoutPassword : customer,
      message: "Customer updated successfully",
    });
  };

  public deleteCustomer = async (req: Request, res: Response) => {
    const { id } = req.params;
    await customerService.deleteCustomer(Number(id));
    res.locals.activityMeta = {
      subjectType: "Customer",
      subjectId: Number(id),
    } satisfies ActivityMeta;
    return res.status(204).send();
  };

  public deleteCustomersBulk = async (req: Request, res: Response) => {
    const { ids } = zodValidation(bulkDeleteSchema, req.body);
    const deleted = await customerService.deleteCustomersBulk(ids);
    res.locals.activityMeta = {
      subjectType: "Customer",
    } satisfies ActivityMeta;
    return res.status(200).json({
      success: true,
      data: { deleted },
      message: `Deleted ${deleted} customer(s)`,
    });
  };

  public deleteAllCustomers = async (req: Request, res: Response) => {
    await customerService.deleteAllCustomers();
    res.locals.activityMeta = {
      subjectType: "Customer",
    } satisfies ActivityMeta;
    return res.status(204).send();
  };
}

export const customersController = new CustomersController();
