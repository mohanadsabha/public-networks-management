import { Request, Response } from "express";
import {
  createSmsGroupSchema,
  createSmsTemplateSchema,
  sendSmsSchema,
  smsAudienceSchema,
  updateSmsGroupSchema,
  updateSmsTemplateSchema,
} from "./sms.validation";
import * as smsService from "./sms.service";
import { ActivityMeta } from "../../middleware/logger.middleware";

class SmsController {
  public getRecipients = async (req: Request, res: Response) => {
    const audience = smsAudienceSchema.parse(req.query.audience ?? "all");
    const search = typeof req.query.search === "string" ? req.query.search : undefined;

    const items = await smsService.getSmsRecipients(audience, search);

    return res.status(200).json({
      success: true,
      data: {
        items,
        total: items.length,
      },
    });
  };

  public getLogs = async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const result = await smsService.getSmsLogs(page, limit);

    return res.status(200).json({
      success: true,
      data: result,
    });
  };

  public listTemplates = async (_req: Request, res: Response) => {
    const items = await smsService.listSmsTemplates();
    return res.status(200).json({
      success: true,
      data: { items },
    });
  };

  public createTemplate = async (req: Request, res: Response) => {
    const input = createSmsTemplateSchema.parse(req.body);
    const created = await smsService.createSmsTemplate(input, req.user.userId);
    res.locals.activityMeta = {
      subjectType: "SMS",
      subjectId: created.id,
      subjectName: created.name,
    } satisfies ActivityMeta;
    return res.status(201).json({
      success: true,
      data: created,
    });
  };

  public updateTemplate = async (req: Request, res: Response) => {
    const input = updateSmsTemplateSchema.parse(req.body);
    const updated = await smsService.updateSmsTemplate(Number(req.params.id), input);
    res.locals.activityMeta = {
      subjectType: "SMS",
      subjectId: updated.id,
      subjectName: updated.name,
    } satisfies ActivityMeta;
    return res.status(200).json({
      success: true,
      data: updated,
    });
  };

  public deleteTemplate = async (req: Request, res: Response) => {
    await smsService.deleteSmsTemplate(Number(req.params.id));
    res.locals.activityMeta = {
      subjectType: "SMS",
      subjectId: Number(req.params.id),
      subjectName: `Template #${req.params.id}`,
    } satisfies ActivityMeta;
    return res.status(200).json({
      success: true,
      message: "Template deleted",
    });
  };

  public listGroups = async (_req: Request, res: Response) => {
    const items = await smsService.listSmsGroups();
    return res.status(200).json({
      success: true,
      data: { items },
    });
  };

  public createGroup = async (req: Request, res: Response) => {
    const input = createSmsGroupSchema.parse(req.body);
    const created = await smsService.createSmsGroup(input, req.user.userId);
    res.locals.activityMeta = {
      subjectType: "SMS",
      subjectId: created.id,
      subjectName: created.name,
    } satisfies ActivityMeta;
    return res.status(201).json({
      success: true,
      data: created,
    });
  };

  public updateGroup = async (req: Request, res: Response) => {
    const input = updateSmsGroupSchema.parse(req.body);
    const updated = await smsService.updateSmsGroup(Number(req.params.id), input);
    res.locals.activityMeta = {
      subjectType: "SMS",
      subjectId: updated.id,
      subjectName: updated.name,
    } satisfies ActivityMeta;
    return res.status(200).json({
      success: true,
      data: updated,
    });
  };

  public deleteGroup = async (req: Request, res: Response) => {
    await smsService.deleteSmsGroup(Number(req.params.id));
    res.locals.activityMeta = {
      subjectType: "SMS",
      subjectId: Number(req.params.id),
      subjectName: `SMS group #${req.params.id}`,
    } satisfies ActivityMeta;
    return res.status(200).json({
      success: true,
      message: "Group deleted",
    });
  };

  public sendSms = async (req: Request, res: Response) => {
    const input = sendSmsSchema.parse(req.body);
    const result = await smsService.sendSms(input, req.user.userId);

    const message =
      result.failedCount > 0 ? `Sent ${result.sentCount}, failed ${result.failedCount}` : "Messages sent successfully";

    res.locals.activityMeta = {
      subjectType: "SMS",
      subjectName: `Send SMS to ${input.phone}`,
    } satisfies ActivityMeta;
    return res.status(200).json({
      success: true,
      message,
      data: result,
    });
  };
}

export const smsController = new SmsController();
