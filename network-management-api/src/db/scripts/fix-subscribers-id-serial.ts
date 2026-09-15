import { sql } from "drizzle-orm";
import { initDb, getDb } from "../../config/db";

/**
 * Converts subscribers.id from legacy varchar (line number) to serial integer PK.
 * Safe when the table is empty or only has rows with NULL id.
 */
async function main() {
  const ok = await initDb();
  if (!ok) {
    console.error("Database connection failed");
    process.exit(1);
  }

  const db = getDb();

  const colResult = await db.execute(sql`
    SELECT data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'subscribers'
      AND column_name = 'id'
    LIMIT 1
  `);
  const colRows = "rows" in colResult ? colResult.rows : [];
  const dataType = (colRows[0] as { data_type?: string } | undefined)?.data_type;
  if (!dataType) {
    console.error("subscribers.id column not found");
    process.exit(1);
  }

  if (dataType === "integer") {
    await db.execute(sql`
      CREATE SEQUENCE IF NOT EXISTS subscribers_id_seq OWNED BY subscribers.id
    `);
    await db.execute(sql`
      ALTER TABLE subscribers ALTER COLUMN id SET DEFAULT nextval('subscribers_id_seq')
    `);
    console.log("subscribers.id already integer — ensured serial default");
    process.exit(0);
  }

  const countResult = await db.execute(sql`
    SELECT COUNT(*)::text AS n FROM subscribers WHERE id IS NOT NULL
  `);
  const countRows = "rows" in countResult ? countResult.rows : [];
  const withId = Number((countRows[0] as { n?: string } | undefined)?.n ?? 0);
  if (withId > 0) {
    console.error(
      `Cannot auto-migrate: ${withId} subscriber(s) still use varchar id. Back up and migrate manually.`
    );
    process.exit(1);
  }

  await db.execute(sql`ALTER TABLE subscribers DROP CONSTRAINT IF EXISTS subscribers_pkey`);
  await db.execute(sql`ALTER TABLE subscribers DROP CONSTRAINT IF EXISTS subscribers_id_unique`);
  await db.execute(sql`ALTER TABLE subscribers DROP COLUMN IF EXISTS id`);
  await db.execute(sql`
    ALTER TABLE subscribers ADD COLUMN id serial PRIMARY KEY
  `);

  console.log("subscribers.id migrated to serial integer PK");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
