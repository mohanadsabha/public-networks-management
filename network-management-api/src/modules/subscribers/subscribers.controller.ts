import { Request, Response } from "express";
import * as ExcelJS from "exceljs";
import { Readable } from "stream";
import * as subscriberService from "./subscribers.service";
import { assignUsernameSchema, updateSubscriberSchema } from "./subscribers.validation";
import AppError from "../../utils/appError";
import {
  formatDateForExport,
  formatSpeedLabel,
  mapStatusForExport,
  parseSubscriberImportWorksheet,
  SUBSCRIBER_EXPORT_HEADERS,
} from "./subscribers.excel";
import { parseUsernameHistoryImportWorksheet, USERNAME_HISTORY_EXPORT_HEADERS } from "./username-history.excel";
import { differenceInCalendarDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { getDaysUntilDisconnect } from "../../utils/disconnectDate.util";
import { ActivityMeta } from "../../middleware/logger.middleware";
import { formatActivitySubjectLabel } from "../../utils/activityLogDetails.util";
import { getDb } from "../../config/db";
import { availableUsernames } from "../../db/schema/availableUsernames";
import { eq, desc, and } from "drizzle-orm";
import { zodValidation } from "../../utils/zod.util";
import { speedTiers } from "../../db/schema/speedTiers";
import { getOnlineUserWithTimeout } from "../mikrotik/mikrotik.controller";
import { isMikrotikLive } from "../../config/mikrotikEnabled";

class SubscribersController {
  public getSubscribers = async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const search = req.query.search as string;
    const suspended = req.query.suspended === "true" ? true : false;
    const expired = req.query.expired === "true" ? true : false;
    const paused = req.query.paused === "true" ? true : false;
    const speedRaw = req.query.speed;
    const speed =
      speedRaw !== undefined && speedRaw !== "" && !Number.isNaN(Number(speedRaw)) ? Number(speedRaw) : undefined;

    const result = await subscriberService.getSubscribers(suspended, expired, paused, page, limit, search, speed);
    return res.status(200).json({
      success: true,
      data: req.user.role === "viewer" ? { ...result, data: result.data.map(({ password, ...rest }) => rest) } : result,
    });
  };

  public updateSubscriber = async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = zodValidation(updateSubscriberSchema, req.body);
    const subscriber = await subscriberService.updateSubscriber(Number(id), validated);

    const { password, ...subscriberWithoutPassword } = subscriber;

    res.locals.activityMeta = {
      subjectType: "Subscriber",
      subjectId: subscriber.id,
      subjectName: formatActivitySubjectLabel({
        lineId: subscriber.lineId,
        name: subscriber.fullName,
      }),
      details: { fields: Object.keys(validated) },
    } satisfies ActivityMeta;
    return res.status(200).json({
      success: true,
      data: req.user.role === "viewer" ? subscriberWithoutPassword : subscriber,
    });
  };

  public deleteSubscriber = async (req: Request, res: Response) => {
    const { id } = req.params;
    await subscriberService.deleteSubscriber(Number(id));
    res.locals.activityMeta = {
      subjectType: "Subscriber",
      subjectId: Number(id),
      subjectName: `Subscriber #${id}`,
    } satisfies ActivityMeta;
    return res.status(204).send();
  };

  public deleteAllSubscribers = async (req: Request, res: Response) => {
    await subscriberService.deleteAllSubscribers();
    res.locals.activityMeta = {
      subjectType: "Subscriber",
      subjectName: "All Subscribers",
    } satisfies ActivityMeta;
    return res.status(204).send();
  };

  public getSubscriberProfile = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw new AppError("Subscriber not found", 404);
    return this.respondSubscriberProfile(req, res, id);
  };

  public getSubscriberProfileByLineId = async (req: Request, res: Response) => {
    const lineId = decodeURIComponent(String(req.params.lineId ?? "")).trim();
    if (!lineId) throw new AppError("Subscriber not found", 404);
    const id = await subscriberService.getSubscriberIdByLineId(lineId);
    if (!id) throw new AppError("Subscriber not found", 404);
    return this.respondSubscriberProfile(req, res, id);
  };

  public getSubscriberConnectionByLineId = async (req: Request, res: Response) => {
    const lineId = decodeURIComponent(String(req.params.lineId ?? "")).trim();
    if (!lineId) throw new AppError("Subscriber not found", 404);
    const id = await subscriberService.getSubscriberIdByLineId(lineId);
    if (!id) throw new AppError("Subscriber not found", 404);
    return this.respondSubscriberConnection(res, id);
  };

  public getSubscriberConnection = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw new AppError("Subscriber not found", 404);
    return this.respondSubscriberConnection(res, id);
  };

  private respondSubscriberProfile = async (req: Request, res: Response, id: number) => {
    const subscriber = await subscriberService.getSubscriberById(id);
    if (!subscriber) throw new AppError("Subscriber not found", 404);

    const nowUTC = toZonedTime(new Date(), "UTC");

    const daysGone = subscriber.startDate
      ? differenceInCalendarDays(nowUTC, toZonedTime(subscriber.startDate, "UTC"))
      : null;

    const daysRemaining = subscriber.endDate
      ? getDaysUntilDisconnect(toZonedTime(subscriber.endDate, "UTC"), nowUTC)
      : null;

    const { password, ...subscriberWithoutPassword } = subscriber;

    return res.status(200).json({
      status: "success",
      data: req.user.role === "viewer" ? subscriberWithoutPassword : subscriber,
      syncTime: Number(process.env.syncTime) || 0,
      daysGone: daysGone !== null ? Math.min(daysGone, 30) : null,
      daysRemaining,
    });
  };

  private respondSubscriberConnection = async (res: Response, id: number) => {
    const subscriber = await subscriberService.getSubscriberById(id);
    if (!subscriber) throw new AppError("Subscriber not found", 404);

    const username = subscriber.username?.trim();
    if (!isMikrotikLive() || !username) {
      return res.status(200).json({
        success: true,
        data: { isOnline: false, connectedTo: null, onlineHost: null },
      });
    }

    try {
      const status = await getOnlineUserWithTimeout(username);
      const onlineUser = status.onlineUser;
      return res.status(200).json({
        success: true,
        data: {
          isOnline: Boolean(onlineUser),
          connectedTo: status.connectedTo ?? null,
          onlineHost: onlineUser?.ipAddress?.trim() || null,
        },
      });
    } catch {
      return res.status(200).json({
        success: true,
        data: { isOnline: false, connectedTo: null, onlineHost: null },
      });
    }
  };

  public getSubscriberLogs = async (req: Request, res: Response) => {
    const { id } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 15;

    const result = await subscriberService.getSubscriberLogs(Number(id), { page, limit });

    return res.status(200).json({
      status: "success",
      data: result,
    });
  };

  public assignUsernameToSubscriber = async (req: Request, res: Response) => {
    const { id, availableUsernameId } = req.params;
    const { changeCause } = zodValidation(assignUsernameSchema, req.body);
    const subscriber = await subscriberService.assignUsernameToSubscriber(
      Number(id),
      req.user.userId,
      Number(availableUsernameId),
      changeCause
    );
    res.locals.activityMeta = {
      subjectType: "Subscriber",
      subjectId: subscriber.id,
      subjectName: formatActivitySubjectLabel({
        lineId: subscriber.lineId,
        name: subscriber.fullName,
      }),
      details: {
        usernameId: Number(availableUsernameId),
        changeCause: changeCause ?? null,
      },
    } satisfies ActivityMeta;
    return res.status(200).json({
      status: "success",
      data: subscriber,
    });
  };

  public autoAssignUsernameToSubscriber = async (req: Request, res: Response) => {
    const { id, speedId } = req.params;
    if (isNaN(Number(id)) || isNaN(Number(speedId))) {
      throw new AppError("id or speedId are invalid", 400);
    }
    const db = getDb();
    const availableUsername = await db
      .select({ id: availableUsernames.id })
      .from(availableUsernames)
      .where(
        and(
          eq(availableUsernames.isExpired, false),
          eq(availableUsernames.isUsed, false),
          eq(speedTiers.id, Number(speedId))
        )
      )
      .innerJoin(speedTiers, eq(speedTiers.id, availableUsernames.speedId))
      .orderBy(desc(availableUsernames.createdAt))
      .limit(1);

    if (availableUsername.length === 0) {
      throw new AppError("There's no available usernames left of the same speed", 400);
    }

    const subscriber = await subscriberService.assignUsernameToSubscriber(
      Number(id),
      req.user.userId,
      Number(availableUsername[0].id)
    );
    res.locals.activityMeta = {
      subjectType: "Subscriber",
      subjectId: subscriber.id,
      subjectName: formatActivitySubjectLabel({
        lineId: subscriber.lineId,
        name: subscriber.fullName,
      }),
      details: { speedId: Number(speedId), autoAssigned: true },
    } satisfies ActivityMeta;
    return res.status(200).json({
      status: "success",
      data: subscriber,
    });
  };

  public renewUsernameBillingCycle = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (isNaN(Number(id))) {
      throw new AppError("id is invalid", 400);
    }

    const subscriber = await subscriberService.renewUsernameBillingCycle(Number(id), req.user.userId);

    res.locals.activityMeta = {
      subjectType: "Subscriber",
      subjectId: subscriber.id,
      subjectName: formatActivitySubjectLabel({
        lineId: subscriber.lineId,
        name: subscriber.fullName,
      }),
      details: { billingCycleRenewal: true, username: subscriber.username },
    } satisfies ActivityMeta;

    return res.status(200).json({
      status: "success",
      data: subscriber,
    });
  };

  public getUsernameHistory = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = await subscriberService.getUsernameHistory(Number(id));
    return res.status(200).json({
      status: "success",
      data,
    });
  };

  public getSpeedHistory = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = await subscriberService.getSpeedHistory(Number(id));
    return res.status(200).json({
      status: "success",
      data,
    });
  };

  public exportSubscribers = async (_req: Request, res: Response) => {
    const rows = await subscriberService.getSubscribersForExport();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("المشتركين");

    worksheet.addRow([...SUBSCRIBER_EXPORT_HEADERS]);

    rows.forEach((row) => {
      worksheet.addRow([
        row.fullName || "-",
        row.lineId || "-",
        row.username || "-",
        row.password || "-",
        row.speedValue ? formatSpeedLabel(row.speedValue) : "-",
        formatDateForExport(row.startDate),
        formatDateForExport(row.endDate),
        mapStatusForExport({
          isPaused: Boolean(row.isPaused),
          username: row.username,
        }),
        row.phone || "-",
        row.facilityType || "-",
      ]);
    });

    worksheet.columns = [
      { width: 24 },
      { width: 14 },
      { width: 20 },
      { width: 14 },
      { width: 10 },
      { width: 16 },
      { width: 14 },
      { width: 14 },
      { width: 14 },
      { width: 18 },
    ];

    const fileName = `subscribers_${new Date().toISOString().split("T")[0]}.xlsx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

    await workbook.xlsx.write(res);
    res.end();
  };

  public exportExpiringSelected = async (req: Request, res: Response) => {
    const rawIds = req.body?.ids;
    const ids = Array.isArray(rawIds)
      ? rawIds.map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0)
      : [];

    const rows = await subscriberService.getSubscribersForExportByIds(ids);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("المنتهية");

    worksheet.addRow([...SUBSCRIBER_EXPORT_HEADERS]);

    rows.forEach((row) => {
      worksheet.addRow([
        row.fullName || "-",
        row.lineId || "-",
        row.username || "-",
        row.password || "-",
        row.speedValue ? formatSpeedLabel(row.speedValue) : "-",
        formatDateForExport(row.startDate),
        formatDateForExport(row.endDate),
        mapStatusForExport({
          isPaused: Boolean(row.isPaused),
          username: row.username,
        }),
        row.phone || "-",
        row.facilityType || "-",
      ]);
    });

    worksheet.columns = [
      { width: 24 },
      { width: 14 },
      { width: 20 },
      { width: 14 },
      { width: 10 },
      { width: 16 },
      { width: 14 },
      { width: 14 },
      { width: 14 },
      { width: 18 },
    ];

    const fileName = `expiring_${new Date().toISOString().split("T")[0]}.xlsx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

    await workbook.xlsx.write(res);

    res.locals.activityMeta = {
      subjectType: "Subscriber",
      subjectName: "Expiring subscribers export",
      details: { exportedCount: rows.length, ids },
    } satisfies ActivityMeta;

    res.end();
  };

  public importSubscribersFromExcel = async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError("No file uploaded", 400);
    }

    const workbook = new ExcelJS.Workbook();
    const stream = Readable.from(req.file.buffer);
    await workbook.xlsx.read(stream);
    const worksheet = workbook.getWorksheet(1);

    if (!worksheet) {
      throw new AppError("No worksheet found in Excel file", 400);
    }

    const parsed = parseSubscriberImportWorksheet(worksheet);

    if (parsed.errors.length > 0) {
      throw new AppError(
        `Validation errors: ${parsed.errors.map((e) => `Row ${e.row}: ${e.message}`).join("; ")}`,
        400
      );
    }

    if (parsed.rows.length === 0) {
      throw new AppError("No valid rows found in Excel file", 400);
    }

    const result = await subscriberService.importSubscribersFromExcel(parsed.rows, req.user.id);

    res.locals.activityMeta = {
      subjectType: "Subscriber",
      subjectName: "Imported Subscribers Excel",
      details: {
        imported: result.imported,
        updated: result.updated,
        skipped: result.skipped + parsed.skipped,
      },
    } satisfies ActivityMeta;

    return res.status(201).json({
      status: "success",
      message: `Imported ${result.imported} new, updated ${result.updated}${
        result.skipped > 0 ? `, skipped ${result.skipped}` : ""
      }`,
      data: {
        imported: result.imported,
        updated: result.updated,
        skipped: result.skipped + parsed.skipped,
        headerRowsSkipped: parsed.skipped,
      },
    });
  };

  public exportUsernameHistory = async (_req: Request, res: Response) => {
    const rows = await subscriberService.getUsernameHistoryForExport();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("سجل أسماء المستخدمين");

    worksheet.addRow([...USERNAME_HISTORY_EXPORT_HEADERS]);

    rows.forEach((row) => {
      worksheet.addRow([
        row.fullName || "-",
        row.lineId || "-",
        row.oldUsername || "-",
        row.oldPassword || "-",
        formatDateForExport(row.usageStartDate),
        formatDateForExport(row.usageEndDate),
      ]);
    });

    worksheet.columns = [{ width: 24 }, { width: 14 }, { width: 20 }, { width: 14 }, { width: 22 }, { width: 20 }];

    const fileName = `username_history_${new Date().toISOString().split("T")[0]}.xlsx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

    await workbook.xlsx.write(res);
    res.end();
  };

  public importUsernameHistoryFromExcel = async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError("No file uploaded", 400);
    }

    const workbook = new ExcelJS.Workbook();
    const stream = Readable.from(req.file.buffer);
    await workbook.xlsx.read(stream);
    const worksheet = workbook.getWorksheet(1);

    if (!worksheet) {
      throw new AppError("No worksheet found in Excel file", 400);
    }

    const parsed = parseUsernameHistoryImportWorksheet(worksheet);

    if (parsed.errors.length > 0) {
      throw new AppError(
        `Validation errors: ${parsed.errors.map((e) => `Row ${e.row}: ${e.message}`).join("; ")}`,
        400
      );
    }

    if (parsed.rows.length === 0) {
      throw new AppError("No valid rows found in Excel file", 400);
    }

    const result = await subscriberService.importUsernameHistoryFromExcel(parsed.rows);

    res.locals.activityMeta = {
      subjectType: "Subscriber",
      subjectName: "Imported Username History Excel",
    } satisfies ActivityMeta;

    return res.status(201).json({
      status: "success",
      message: `Imported ${result.imported} history row(s)${result.skipped > 0 ? `, skipped ${result.skipped}` : ""}`,
      data: {
        imported: result.imported,
        skipped: result.skipped + parsed.skipped,
        headerRowsSkipped: parsed.skipped,
      },
    });
  };
}

export const subscribersController = new SubscribersController();
