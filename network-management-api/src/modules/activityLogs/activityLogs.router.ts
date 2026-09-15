import { Router, Request, Response } from "express";
import { activityLogs } from "../../db/schema/activityLogs";
import { getDb } from "../../config/db";
import { desc, ilike, gte, lte, and, SQL, or } from "drizzle-orm";
import { protect, restrictTo } from "../../middleware/auth.middleware";

const router = Router();
router.use(protect);
router.use(restrictTo("admin", "super_admin"));
/**
 * GET /api/activity-logs
 *
 * Query params:
 *   name        – filter by subjectName (partial, case-insensitive)
 *   startDate   – ISO date string  e.g. 2026-06-01
 *   endDate     – ISO date string  e.g. 2026-06-08
 *   page        – page number (default: 1)
 *   limit       – rows per page   (default: 20)
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { name, startDate, endDate, page = "1", limit = "20" } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    // ── Build dynamic WHERE conditions ──────────────────────────────────────
    const conditions: SQL[] = [];

    if (name?.trim()) {
      const term = `%${name.trim()}%`;
      conditions.push(
        or(
          ilike(activityLogs.subjectName, term),
          ilike(activityLogs.adminName, term),
          ilike(activityLogs.details, term),
          ilike(activityLogs.endpoint, term)
        )!
      );
    }

    if (startDate) {
      conditions.push(gte(activityLogs.createdAt, new Date(startDate)));
    }

    if (endDate) {
      // Include the full end day by pushing to end-of-day
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      conditions.push(lte(activityLogs.createdAt, end));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    // ── Query ───────────────────────────────────────────────────────────────
    const rows = await db
      .select()
      .from(activityLogs)
      .where(where)
      .orderBy(desc(activityLogs.createdAt))
      .limit(limitNum)
      .offset(offset);

    // ── Total count for pagination ──────────────────────────────────────────
    const [{ count }] = await db.select({ count: db.$count(activityLogs, where) }).from(activityLogs);

    return res.json({
      data: rows,
      meta: {
        total: Number(count),
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(Number(count) / limitNum),
      },
    });
  } catch (err) {
    console.error("[ActivityLogs] GET /:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
