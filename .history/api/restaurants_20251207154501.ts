import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure WebSocket for Node.js
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

    const { governorateId, districtId } = req.query;
    
    let query = 'SELECT * FROM restaurants WHERE status = $1';
    const params: string[] = ['active'];
    
    if (governorateId) {
      params.push(governorateId as string);
      query += ` AND governorate_id = $${params.length}`;
    }
    
    if (districtId) {
      params.push(districtId as string);
      query += ` AND district_id = $${params.length}`;
    }
    
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    await pool.end();

    res.status(200).json(toCamelCase(result.rows));
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Failed to fetch restaurants',
      details: (error as Error).message,
      stack: (error as Error).stack
    });
  }
}
