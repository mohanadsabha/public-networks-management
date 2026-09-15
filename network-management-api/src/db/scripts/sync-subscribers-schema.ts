import { sql } from "drizzle-orm";
import { initDb, getDb } from "../../config/db";

/**
 * Aligns live DB with drizzle schema when migrations were not fully applied (e.g. Supabase).
 */
async function main() {
  const ok = await initDb();
  if (!ok) {
    console.error("Database connection failed");
    process.exit(1);
  }

  const db = getDb();

  await db.execute(sql`
    ALTER TABLE "subscribers" ADD COLUMN IF NOT EXISTS "username_id" integer
  `);

  await db.execute(sql`
    ALTER TABLE "subscribers" ADD COLUMN IF NOT EXISTS "line_id" varchar(20)
  `);

  await db.execute(sql`
    ALTER TABLE "subscribers" ADD COLUMN IF NOT EXISTS "suspend_at" timestamp with time zone DEFAULT now()
  `);

  await db.execute(sql`
    ALTER TABLE "subscribers" DROP COLUMN IF EXISTS "speed_id"
  `);
  await db.execute(sql`
    ALTER TABLE "subscribers" DROP COLUMN IF EXISTS "is_active"
  `);
  await db.execute(sql`
    ALTER TABLE "subscribers" DROP COLUMN IF EXISTS "updated_at"
  `);

  await db.execute(sql`
    UPDATE "subscribers"
    SET "line_id" = "id"::varchar(20)
    WHERE "line_id" IS NULL AND "id" IS NOT NULL
  `);

  await db.execute(sql`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'subscribers_line_id_unique'
      ) THEN
        ALTER TABLE "subscribers" ADD CONSTRAINT "subscribers_line_id_unique" UNIQUE("line_id");
      END IF;
    END $$
  `);

  console.log("subscribers schema sync complete (username_id, line_id, suspend_at)");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
