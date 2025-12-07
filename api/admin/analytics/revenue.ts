import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

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
    const result = await pool.query('SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status = $1', ['completed']);
    await pool.end();

    // Return monthly revenue data
    res.status(200).json({
      total: parseFloat(result.rows[0]?.total || '0'),
      monthly: []
    });
  } catch (error) {
    console.error('Revenue error:', error);
    res.status(500).json({
      error: 'Failed to fetch revenue',
      details: (error as Error).message
    });
  }
}
