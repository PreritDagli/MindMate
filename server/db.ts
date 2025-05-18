import { Pool, ClientConfig } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Use database URL if available, otherwise use individual connection parameters
let connectionConfig: ClientConfig;

if (process.env.DATABASE_URL) {
  connectionConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: false
  };
} else if (process.env.PGHOST) {
  connectionConfig = {
    host: process.env.PGHOST,
    port: parseInt(process.env.PGPORT || '5432'),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    ssl: false
  };
} else {
  throw new Error("No database connection details found. Please set DATABASE_URL or PGHOST, PGPORT, etc.");
}

export const pool = new Pool(connectionConfig);
export const db = drizzle(pool, { schema });