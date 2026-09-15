import { Request, Response } from "express";
import * as usernameService from "./usernames.service";
import { zodValidation } from "../../utils/zod.util";
import AppError from "../../utils/appError";
import * as ExcelJS from "exceljs";
import {
  AddAvailableUsername,
  addAvailableUsernameSchema,
  UpdateAvailableUsername,
  updateAvailableUsernameSchema,
  StringObject,
} from "./usernames.validation";
import { Readable } from "stream";
import { ActivityMeta } from "../../middleware/logger.middleware";
import { buildPackageLabel, parseImportWorksheet } from "./usernames.excel";
import { getDb } from "../../config/db";
import { speedTiers } from "../../db/schema/speedTiers";
import { eq, and } from "drizzle-orm";

class UsernamesController {
  public getAvailableUsernames = async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const result = await usernameService.getAvailableUsernames(Number(req.params.speedId), page, limit);
    return res.status(200).json({
      success: true,
      data: result,
    });
  };

  public addAvailableUsername = async (
    req: Request<StringObject, StringObject, AddAvailableUsername>,
    res: Response
  ) => {
    const validatedData = zodValidation(addAvailableUsernameSchema, req.body);
    const result = await usernameService.addAvailableUsername(
      validatedData.username,
      validatedData.password,
      Number(req.params.speedId),
      validatedData.isOwnerUsername,
      validatedData.isUsed,
      validatedData.startDate ? new Date(validatedData.startDate) : undefined
    );
    res.locals.activityMeta = {
      subjectType: "Username",
      subjectId: result.id,
      subjectName: result.username,
    } satisfies ActivityMeta;
    return res.status(201).json({
      status: "success",
      data: result,
    });
  };

  public updateAvailableUsername = async (
    req: Request<StringObject, StringObject, UpdateAvailableUsername>,
    res: Response
  ) => {
    const { id } = req.params;
    const validatedData = zodValidation(updateAvailableUsernameSchema, req.body);
    const result = await usernameService.updateAvailableUsername(
      Number(id),
      validatedData.username,
      validatedData.password,
      validatedData.isOwnerUsername,
      validatedData.isUsed,
      validatedData.startDate ? new Date(validatedData.startDate) : undefined
    );
    res.locals.activityMeta = {
      subjectType: "Username",
      subjectId: result[0].id,
      subjectName: result[0].username,
    } satisfies ActivityMeta;
    return res.status(200).json({
      status: "success",
      data: result,
    });
  };

  public deleteAvailableUsername = async (req: Request, res: Response) => {
    const { id } = req.params;
    await usernameService.deleteAvailableUsername(Number(id));
    res.locals.activityMeta = {
      subjectType: "Username",
      subjectId: Number(id),
      subjectName: `Username #${id}`,
    } satisfies ActivityMeta;
    return res.status(204).send();
  };

  public deleteAllAvailableUsernamesForSpeed = async (req: Request, res: Response) => {
    const speedId = Number(req.params.speedId);
    const deleted = await usernameService.deleteAllAvailableUsernamesForSpeed(speedId);
    res.locals.activityMeta = {
      subjectType: "Username",
      subjectName: "All Available Usernames",
    } satisfies ActivityMeta;
    return res.status(200).json({
      status: "success",
      message: `Deleted ${deleted} username(s) for this speed`,
      data: { deleted },
    });
  };

  public resetUsernameBillingCycle = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await usernameService.resetUsernameBillingCycle(Number(id), req.user.userId);
    res.locals.activityMeta = {
      subjectType: "Username",
      subjectId: Number(id),
      subjectName: result.username ?? `Username #${id}`,
      details: { billingCycleReset: true },
    } satisfies ActivityMeta;
    return res.status(200).json({
      status: "success",
      data: result,
    });
  };

  public importUsernamesFromExcel = async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError("No file uploaded", 400);
    }

    const speedId = Number(req.params.speedId);
    const db = getDb();
    const [tier] = await db
      .select({ speedValue: speedTiers.speedValue })
      .from(speedTiers)
      .where(and(eq(speedTiers.id, speedId), eq(speedTiers.deleted, false)))
      .limit(1);

    if (!tier) {
      throw new AppError("Speed tier not found or removed", 404);
    }

    const workbook = new ExcelJS.Workbook();
    const stream = Readable.from(req.file.buffer);
    await workbook.xlsx.read(stream);
    const worksheet = workbook.getWorksheet(1);

    if (!worksheet) {
      throw new AppError("No worksheet found in Excel file", 400);
    }

    const parsed = parseImportWorksheet(worksheet, tier.speedValue);

    if (parsed.errors.length > 0) {
      throw new AppError(
        `Validation errors: ${parsed.errors.map((e) => `Row ${e.row}: ${e.message}`).join("; ")}`,
        400
      );
    }

    if (parsed.rows.length === 0) {
      throw new AppError("No valid rows found in Excel file", 400);
    }

    const result = await usernameService.importUsernamesFromExcel(parsed.rows, speedId);

    res.locals.activityMeta = {
      subjectType: "Username",
      subjectName: `Imported Usernames for Speed ${speedId}`,
    } satisfies ActivityMeta;

    const headerSkipped = parsed.skipped;
    return res.status(201).json({
      status: "success",
      message: `Imported ${result.imported} username(s)${result.skipped > 0 ? `, skipped ${result.skipped}` : ""}`,
      data: {
        imported: result.imported,
        skipped: result.skipped + headerSkipped,
        headerRowsSkipped: headerSkipped,
        duplicateSkipped: result.skipped,
        skippedDetails: result.skippedDetails,
      },
    });
  };

  public exportAvailableUsernames = async (req: Request, res: Response) => {
    const speedId = Number(req.params.speedId);
    const { data, speedValue, price } = await usernameService.getAvailableUsernamesForExport(speedId);
    const packageLabel = buildPackageLabel(speedValue, price ?? 0);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("available_usernames");

    worksheet.addRow(["Username", "Password", "Package"]);

    data.forEach((u) => {
      worksheet.addRow([u.username || "-", u.password || "-", packageLabel]);
    });

    worksheet.columns = [{ width: 28 }, { width: 16 }, { width: 42 }];

    const suffix = speedValue ? `_${speedValue}m` : "_all";
    const fileName = `available_usernames${suffix}_${new Date().toISOString().split("T")[0]}.xlsx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

    await workbook.xlsx.write(res);
    res.end();
  };
}

export const usernamesController = new UsernamesController();
