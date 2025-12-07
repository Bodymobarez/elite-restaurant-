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
    const result = await pool.query('SELECT COUNT(*) as count FROM users');
    await pool.end();

    res.status(200).json({
      total: parseInt(result.rows[0]?.count || '0'),
      monthly: []
    });
  } catch (error) {
    console.error('User growth error:', error);
    res.status(500).json({
      error: 'Failed to fetch user growth',
      details: (error as Error).message
    });
  }
}
