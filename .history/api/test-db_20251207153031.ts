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
    const result = await pool.query('SELECT NOW() as time');
    await pool.end();

    res.status(200).json({
      status: 'ok',
      dbTime: result.rows[0].time,
      message: 'Database connection successful!'
    });
  } catch (error) {
    console.error('DB Error:', error);
    res.status(500).json({
      error: 'Database connection failed',
      details: (error as Error).message,
      stack: (error as Error).stack
    });
  }
}
