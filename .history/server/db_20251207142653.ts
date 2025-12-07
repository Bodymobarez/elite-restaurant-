import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn(
    "WARNING: DATABASE_URL is not set. Database operations will fail.",
  );
}

export const pool = connectionString ? new Pool({ connectionString }) : null;
export const db = pool ? drizzle({ client: pool, schema }) : null as any;
