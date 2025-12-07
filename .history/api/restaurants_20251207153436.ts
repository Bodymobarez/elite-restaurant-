import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

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

    // Use raw SQL query instead of Drizzle
    const result = await pool.query('SELECT * FROM restaurants WHERE status = $1', ['active']);
    await pool.end();

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Failed to fetch restaurants',
      details: (error as Error).message,
      stack: (error as Error).stack
    });
  }
}
