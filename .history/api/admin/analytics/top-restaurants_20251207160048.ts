import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

if (typeof globalThis.WebSocket === 'undefined') {
  neonConfig.webSocketConstructor = ws;
}

function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result: any, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = toCamelCase(obj[key]);
      return result;
    }, {});
  }
  return obj;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      return res.status(500).json({ error: 'DATABASE_URL not set' });
    }

    const pool = new Pool({ connectionString });
    const result = await pool.query(`
      SELECT r.id, r.name, r.logo, r.rating, 
             COUNT(DISTINCT res.id) as reservation_count,
             COUNT(DISTINCT o.id) as order_count
      FROM restaurants r
      LEFT JOIN reservations res ON r.id = res.restaurant_id
      LEFT JOIN orders o ON r.id = o.restaurant_id
      GROUP BY r.id, r.name, r.logo, r.rating
      ORDER BY reservation_count DESC, order_count DESC
      LIMIT 10
    `);
    await pool.end();

    res.status(200).json(toCamelCase(result.rows));
  } catch (error) {
    console.error('Top restaurants error:', error);
    res.status(500).json({
      error: 'Failed to fetch top restaurants',
      details: (error as Error).message
    });
  }
}
