import { Request } from "express";

export function parseStatisticsDateQuery(req: Request): string {
  const dateRaw = req.query.date;
  return typeof dateRaw === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateRaw)
    ? dateRaw
    : new Date().toISOString().slice(0, 10);
}

export function parseStatisticsPaginationQuery(req: Request) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 8));
  return { page, limit };
}
