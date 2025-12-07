import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

if (typeof globalThis.WebSocket === 'undefined') {
  neonConfig.webSocketConstructor = ws;
}

// Convert snake_case to camelCase
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
    
    const governorateId = req.query.governorateId as string | undefined;
    
    let result;
    if (governorateId) {
      result = await pool.query('SELECT * FROM districts WHERE governorate_id = $1 ORDER BY name', [governorateId]);
    } else {
      result = await pool.query('SELECT * FROM districts ORDER BY name');
    }
    
    await pool.end();

    res.status(200).json(toCamelCase(result.rows));
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Failed to fetch districts',
      details: (error as Error).message
    });
  }
}
