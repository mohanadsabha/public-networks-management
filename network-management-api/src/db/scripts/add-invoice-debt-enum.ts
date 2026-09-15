import "dotenv/config";
import { Pool } from "pg";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await pool.query(`ALTER TYPE "public"."invoice_status" ADD VALUE IF NOT EXISTS 'debt'`);
    console.log('Added "debt" to invoice_status enum (or already present).');
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
