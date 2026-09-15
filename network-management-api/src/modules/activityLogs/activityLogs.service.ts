import { getDb } from "../../config/db";
import { activityLogs, NewActivityLog } from "../../db/schema/activityLogs";

export async function insertActivityLog(payload: NewActivityLog): Promise<void> {
  try {
    const db = getDb();
    await db.insert(activityLogs).values(payload);
  } catch (err) {
    // Never let a logging failure crash the main request
    console.error("[ActivityLog] Failed to insert log:", err);
  }
}
