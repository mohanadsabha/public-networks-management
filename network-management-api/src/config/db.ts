import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

let client: NodePgDatabase | null = null;

export async function initDb() {
  if (client) return true;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  client = drizzle(pool);
  return !!client;
}

export function getDb() {
  if (!client) throw new Error("DB not initialized. Call initDb() first.");
  return client;
}
