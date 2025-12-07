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

    // Get counts from various tables
    const [usersResult, restaurantsResult, reservationsResult, ordersResult] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users'),
      pool.query('SELECT COUNT(*) as count FROM restaurants'),
      pool.query('SELECT COUNT(*) as count FROM reservations'),
      pool.query('SELECT COUNT(*) as count FROM orders')
    ]);

    // Get revenue
    const revenueResult = await pool.query('SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status = $1', ['completed']);

    await pool.end();

    res.status(200).json({
      totalUsers: parseInt(usersResult.rows[0]?.count || '0'),
      totalRestaurants: parseInt(restaurantsResult.rows[0]?.count || '0'),
      totalReservations: parseInt(reservationsResult.rows[0]?.count || '0'),
      totalOrders: parseInt(ordersResult.rows[0]?.count || '0'),
      totalRevenue: parseFloat(revenueResult.rows[0]?.total || '0'),
      pendingReservations: 0,
      activeUsers: parseInt(usersResult.rows[0]?.count || '0')
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch stats',
      details: (error as Error).message
    });
  }
}
