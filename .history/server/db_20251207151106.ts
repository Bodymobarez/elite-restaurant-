import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Only set WebSocket constructor in Node.js environment (not in Vercel Edge)
if (typeof globalThis.WebSocket === 'undefined') {
  neonConfig.webSocketConstructor = ws;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn(
    "WARNING: DATABASE_URL is not set. Database operations will fail.",
  );
}

// Create pool with connection string - handle both environments
export const pool = connectionString 
  ? new Pool({ connectionString }) 
  : null;

export const db = pool 
  ? drizzle({ client: pool, schema }) 
  : null as any;
