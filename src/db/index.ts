import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is not set. " +
    "Expected a Neon connection string like postgresql://user:pass@host/db?sslmode=require"
  );
}

const sql = neon(DATABASE_URL);
export const db = drizzle(sql, { schema });
