import { Request, Response, NextFunction } from "express";
import { insertActivityLog } from "../modules/activityLogs/activityLogs.service";
import { activityActionEnum, subjectTypeEnum } from "../db/schema/activityLogs";
import { adminUsers } from "../db/schema/adminUsers";
import { getDb } from "../config/db";
import { eq } from "drizzle-orm";
import { buildActivityDetails } from "../utils/activityLogDetails.util";

type ActivityAction = (typeof activityActionEnum.enumValues)[number];
type SubjectType = (typeof subjectTypeEnum.enumValues)[number];

export interface ActivityMeta {
  subjectType: SubjectType;
  subjectId?: number;
  subjectName?: string | null;
  action?: ActivityAction;
  /** Extra JSON stored in activity_logs.details (merged with request context). */
  details?: Record<string, unknown> | string;
}

function resolveAction(method: string): ActivityAction | null {
  switch (method.toUpperCase()) {
    case "POST":
      return "Created";
    case "PUT":
    case "PATCH":
      return "Updated";
    case "DELETE":
      return "Deleted";
    default:
      return null;
  }
}

function getIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  const realIp = req.headers["x-real-ip"];
  const cfIp = req.headers["cf-connecting-ip"];

  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  if (typeof realIp === "string") {
    return realIp;
  }
  if (typeof cfIp === "string") {
    return cfIp;
  }
  return req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress || "unknown";
}

async function persistActivityLog(req: Request, res: Response): Promise<void> {
  const action = resolveAction(req.method);
  if (!action || res.statusCode >= 400) return;

  const meta = res.locals.activityMeta as ActivityMeta | undefined;
  if (!meta) return;

  const db = getDb();
  const userId = req.user?.userId;

  let adminId: number | null = null;
  let adminName = "System";

  if (userId) {
    const [admin] = await db
      .select({ id: adminUsers.id, name: adminUsers.name })
      .from(adminUsers)
      .where(eq(adminUsers.id, userId))
      .limit(1);

    if (admin) {
      adminId = admin.id;
      adminName = admin.name;
    }
  }

  const details =
    typeof meta.details === "string"
      ? meta.details
      : buildActivityDetails(req, meta.details);

  await insertActivityLog({
    adminId,
    adminName,
    action: meta.action ?? action,
    subjectType: meta.subjectType,
    subjectId: meta.subjectId ?? null,
    subjectName: meta.subjectName ?? null,
    method: req.method.toUpperCase(),
    endpoint: req.originalUrl,
    statusCode: res.statusCode,
    ipAddress: getIp(req),
    details,
  });
}

/**
 * Registers a finish hook before routes run; handlers set res.locals.activityMeta
 * and route-level protect sets req.user before the response completes.
 */
export function activityLogMiddleware(req: Request, res: Response, next: NextFunction): void {
  res.on("finish", () => {
    void persistActivityLog(req, res).catch((err) => {
      console.error("[ActivityLogMiddleware] Unexpected error:", err);
    });
  });
  next();
}
