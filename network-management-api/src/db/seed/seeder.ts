import { initDb, getDb } from "../../config/db";
import { sql } from "drizzle-orm";
import bcrypt from "bcrypt";

async function seed() {
  const ok = await initDb();
  if (!ok) {
    console.error("Database connection failed");
    process.exit(1);
  }

  const db = getDb();
  const username = process.env.ADMIN_USERNAME ?? "superadmin";
  const password = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? "admin123", 10);

  // 1. Seed roles
  await db.execute(sql`
    INSERT INTO roles (name, display_name)
    VALUES 
      ('super_admin', 'Super Admin'),
      ('admin', 'Admin'),
      ('viewer', 'Viewer')
    ON CONFLICT (name) DO NOTHING
  `);

  // 2. Seed super admin user
  await db.execute(sql`
    INSERT INTO admin_users (name, username, email, password, role_id, status)
    SELECT
      'Super Admin',
      ${username},
      'superadmin@we.wifi',
      ${password},
      id,
      'active'
    FROM roles
    WHERE name = 'super_admin'
    ON CONFLICT (username) DO UPDATE SET
      name       = EXCLUDED.name,
      email      = EXCLUDED.email,
      password   = EXCLUDED.password,
      role_id    = EXCLUDED.role_id,
      status     = EXCLUDED.status
  `);

  console.log(`Seed complete: ${username} created/updated`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed", err);
  process.exit(1);
});
