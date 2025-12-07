import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '../shared/schema';

// Configure WebSocket for Node.js
if (typeof globalThis.WebSocket === 'undefined') {
  neonConfig.webSocketConstructor = ws;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      return res.status(500).json({ error: 'DATABASE_URL not set' });
    }

    const pool = new Pool({ connectionString });
    const db = drizzle({ client: pool, schema });

    const restaurants = await db.select().from(schema.restaurants);
    await pool.end();

    res.status(200).json(restaurants);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Failed to fetch restaurants',
      details: (error as Error).message,
      stack: (error as Error).stack
    });
  }
}
