import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool, neonConfig } from '@neondatabase/serverless';
import bcrypt from 'bcrypt';
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

async function getPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL not set');
  }
  return new Pool({ connectionString });
}

// Route handlers
async function handleHealth(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
}

async function handleRestaurants(req: VercelRequest, res: VercelResponse) {
  const pool = await getPool();
  try {
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
    res.status(200).json(toCamelCase(result.rows));
  } finally {
    await pool.end();
  }
}

async function handleGovernorates(req: VercelRequest, res: VercelResponse) {
  const pool = await getPool();
  try {
    const result = await pool.query('SELECT * FROM governorates ORDER BY name');
    res.status(200).json(toCamelCase(result.rows));
  } finally {
    await pool.end();
  }
}

async function handleDistricts(req: VercelRequest, res: VercelResponse) {
  const pool = await getPool();
  try {
    const { governorateId } = req.query;
    let query = 'SELECT * FROM districts';
    const params: string[] = [];
    
    if (governorateId) {
      params.push(governorateId as string);
      query += ' WHERE governorate_id = $1';
    }
    query += ' ORDER BY name';

    const result = await pool.query(query, params);
    res.status(200).json(toCamelCase(result.rows));
  } finally {
    await pool.end();
  }
}

async function handleAuthMe(req: VercelRequest, res: VercelResponse) {
  res.status(401).json({ error: 'Not authenticated' });
}

async function handleAuthLogin(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const pool = await getPool();
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { password: _, ...userWithoutPassword } = toCamelCase(user);
    res.status(200).json(userWithoutPassword);
  } finally {
    await pool.end();
  }
}

async function handleAuthRegister(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const pool = await getPool();
  try {
    const { email, password, name, role = 'customer' } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name required' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, hashedPassword, name, role]
    );

    const { password: _, ...userWithoutPassword } = toCamelCase(result.rows[0]);
    res.status(201).json(userWithoutPassword);
  } finally {
    await pool.end();
  }
}

async function handleAuthLogout(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ message: 'Logged out' });
}

async function handleAdminStats(req: VercelRequest, res: VercelResponse) {
  const pool = await getPool();
  try {
    const [users, restaurants, reservations, orders, revenue] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users'),
      pool.query('SELECT COUNT(*) as count FROM restaurants'),
      pool.query('SELECT COUNT(*) as count FROM reservations'),
      pool.query('SELECT COUNT(*) as count FROM orders'),
      pool.query('SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status = $1', ['completed'])
    ]);

    res.status(200).json({
      totalUsers: parseInt(users.rows[0]?.count || '0'),
      totalRestaurants: parseInt(restaurants.rows[0]?.count || '0'),
      totalReservations: parseInt(reservations.rows[0]?.count || '0'),
      totalOrders: parseInt(orders.rows[0]?.count || '0'),
      totalRevenue: parseFloat(revenue.rows[0]?.total || '0'),
      pendingReservations: 0,
      activeUsers: parseInt(users.rows[0]?.count || '0')
    });
  } finally {
    await pool.end();
  }
}

async function handleAdminUsers(req: VercelRequest, res: VercelResponse) {
  const pool = await getPool();
  try {
    const result = await pool.query('SELECT id, email, name, role, phone, avatar, created_at FROM users ORDER BY created_at DESC');
    res.status(200).json(toCamelCase(result.rows));
  } finally {
    await pool.end();
  }
}

async function handleAdminRestaurants(req: VercelRequest, res: VercelResponse) {
  const pool = await getPool();
  try {
    const result = await pool.query('SELECT * FROM restaurants ORDER BY created_at DESC');
    res.status(200).json(toCamelCase(result.rows));
  } finally {
    await pool.end();
  }
}

async function handleAdminReservations(req: VercelRequest, res: VercelResponse) {
  const pool = await getPool();
  try {
    const result = await pool.query(`
      SELECT r.*, u.name as user_name, u.email as user_email, rest.name as restaurant_name
      FROM reservations r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN restaurants rest ON r.restaurant_id = rest.id
      ORDER BY r.created_at DESC
    `);
    res.status(200).json(toCamelCase(result.rows));
  } finally {
    await pool.end();
  }
}

async function handleAdminOrders(req: VercelRequest, res: VercelResponse) {
  const pool = await getPool();
  try {
    const result = await pool.query(`
      SELECT o.*, u.name as user_name, rest.name as restaurant_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN restaurants rest ON o.restaurant_id = rest.id
      ORDER BY o.created_at DESC
    `);
    res.status(200).json(toCamelCase(result.rows));
  } finally {
    await pool.end();
  }
}

async function handleAdminNotifications(req: VercelRequest, res: VercelResponse) {
  res.status(200).json([]);
}

async function handleAdminActivityLogs(req: VercelRequest, res: VercelResponse) {
  const pool = await getPool();
  try {
    const result = await pool.query(`
      SELECT al.*, u.name as user_name
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 50
    `);
    res.status(200).json(toCamelCase(result.rows));
  } finally {
    await pool.end();
  }
}

async function handleAdminAnalyticsRevenue(req: VercelRequest, res: VercelResponse) {
  const pool = await getPool();
  try {
    const result = await pool.query('SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status = $1', ['completed']);
    res.status(200).json({ total: parseFloat(result.rows[0]?.total || '0'), monthly: [] });
  } finally {
    await pool.end();
  }
}

async function handleAdminAnalyticsUserGrowth(req: VercelRequest, res: VercelResponse) {
  const pool = await getPool();
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM users');
    res.status(200).json({ total: parseInt(result.rows[0]?.count || '0'), monthly: [] });
  } finally {
    await pool.end();
  }
}

async function handleAdminAnalyticsTopRestaurants(req: VercelRequest, res: VercelResponse) {
  const pool = await getPool();
  try {
    const result = await pool.query(`
      SELECT r.id, r.name, r.logo, r.rating,
             COUNT(DISTINCT res.id) as reservation_count,
             COUNT(DISTINCT o.id) as order_count
      FROM restaurants r
      LEFT JOIN reservations res ON r.id = res.restaurant_id
      LEFT JOIN orders o ON r.id = o.restaurant_id
      GROUP BY r.id, r.name, r.logo, r.rating
      ORDER BY reservation_count DESC
      LIMIT 10
    `);
    res.status(200).json(toCamelCase(result.rows));
  } finally {
    await pool.end();
  }
}

async function handleSeed(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST to seed data' });
  }

  const pool = await getPool();
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Clear and seed data
    await pool.query('DELETE FROM order_items');
    await pool.query('DELETE FROM orders');
    await pool.query('DELETE FROM reservations');
    await pool.query('DELETE FROM reviews');
    await pool.query('DELETE FROM favorites');
    await pool.query('DELETE FROM menu_items');
    await pool.query('DELETE FROM restaurants');
    await pool.query('DELETE FROM notifications');
    await pool.query('DELETE FROM activity_logs');
    await pool.query('DELETE FROM districts');
    await pool.query('DELETE FROM governorates');
    await pool.query('DELETE FROM users');

    // Governorates
    const govs = [
      ['Cairo', 'القاهرة'],
      ['Giza', 'الجيزة'],
      ['Alexandria', 'الإسكندرية']
    ];
    const govIds: Record<string, string> = {};
    for (const [name, nameAr] of govs) {
      const r = await pool.query('INSERT INTO governorates (name, name_ar) VALUES ($1, $2) RETURNING id', [name, nameAr]);
      govIds[name] = r.rows[0].id;
    }

    // Districts
    const dists = [
      ['Cairo', 'Nasr City', 'مدينة نصر'],
      ['Cairo', 'Heliopolis', 'مصر الجديدة'],
      ['Cairo', 'Maadi', 'المعادي'],
      ['Cairo', 'Zamalek', 'الزمالك'],
      ['Giza', 'Dokki', 'الدقي'],
      ['Giza', 'Mohandessin', 'المهندسين'],
      ['Alexandria', 'Stanley', 'ستانلي']
    ];
    const distIds: Record<string, string> = {};
    for (const [gov, name, nameAr] of dists) {
      const r = await pool.query('INSERT INTO districts (governorate_id, name, name_ar) VALUES ($1, $2, $3) RETURNING id', [govIds[gov], name, nameAr]);
      distIds[name] = r.rows[0].id;
    }

    // Users
    const users = [
      ['admin@eliterestaurant.com', 'Admin', 'admin'],
      ['owner1@eliterestaurant.com', 'Ahmed Hassan', 'restaurant_owner'],
      ['customer1@gmail.com', 'Fatma Ibrahim', 'customer'],
      ['customer2@gmail.com', 'Omar Khaled', 'customer']
    ];
    const userIds: Record<string, string> = {};
    for (const [email, name, role] of users) {
      const r = await pool.query('INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id', [email, hashedPassword, name, role]);
      userIds[email] = r.rows[0].id;
    }

    // Restaurants
    const restaurants = [
      ['The Nile View', 'Egyptian', 'مطعم فاخر يطل على النيل', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', 'Cairo', 'Zamalek', '$$$$', '4.8'],
      ['Kebabgy', 'Grills', 'أشهى المشويات والكباب', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', 'Cairo', 'Nasr City', '$$$', '4.6'],
      ['Sushi Master', 'Japanese', 'أفضل السوشي في مصر', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800', 'Giza', 'Dokki', '$$$$', '4.7'],
      ['Pasta Palace', 'Italian', 'المطبخ الإيطالي الأصيل', 'https://images.unsplash.com/photo-1481931098730-318b6f776db0?w=800', 'Giza', 'Mohandessin', '$$$', '4.5'],
      ['Seafood House', 'Seafood', 'أطازج المأكولات البحرية', 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800', 'Alexandria', 'Stanley', '$$$$', '4.9'],
      ['Burger Lab', 'American', 'برجر جورميه مميز', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', 'Cairo', 'Maadi', '$$', '4.4']
    ];
    const restIds: Record<string, string> = {};
    for (const [name, cuisine, desc, img, gov, dist, price, rating] of restaurants) {
      const r = await pool.query(
        'INSERT INTO restaurants (owner_id, name, cuisine, description, image, address, governorate_id, district_id, price_range, rating, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id',
        [userIds['owner1@eliterestaurant.com'], name, cuisine, desc, img, `${dist}, ${gov}`, govIds[gov], distIds[dist], price, rating, 'active']
      );
      restIds[name] = r.rows[0].id;
    }

    // Menu Items
    const menuItems = [
      ['The Nile View', 'كشري مصري', 'كشري أصيل مع الصلصة', '45.00', 'Main'],
      ['The Nile View', 'ملوخية', 'ملوخية خضراء طازجة', '80.00', 'Main'],
      ['Kebabgy', 'كباب مشوي', 'كباب لحم على الفحم', '120.00', 'Main'],
      ['Kebabgy', 'كفتة', 'كفتة مشوية', '100.00', 'Main'],
      ['Sushi Master', 'سلمون رول', 'رول سوشي بالسلمون', '180.00', 'Sushi'],
      ['Pasta Palace', 'سباجيتي', 'سباجيتي بولونيز', '95.00', 'Pasta'],
      ['Seafood House', 'جمبري مشوي', 'جمبري جامبو', '280.00', 'Main'],
      ['Burger Lab', 'كلاسيك برجر', 'برجر لحم مع جبن', '85.00', 'Burgers']
    ];
    for (const [rest, name, desc, price, cat] of menuItems) {
      await pool.query(
        'INSERT INTO menu_items (restaurant_id, name, description, price, category) VALUES ($1, $2, $3, $4, $5)',
        [restIds[rest], name, desc, price, cat]
      );
    }

    // Reservations
    const today = new Date().toISOString().split('T')[0];
    await pool.query(
      'INSERT INTO reservations (user_id, restaurant_id, date, time, party_size, status, confirmation_code) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [userIds['customer1@gmail.com'], restIds['The Nile View'], today, '19:00', 4, 'confirmed', 'RES001']
    );
    await pool.query(
      'INSERT INTO reservations (user_id, restaurant_id, date, time, party_size, status, confirmation_code) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [userIds['customer2@gmail.com'], restIds['Sushi Master'], today, '20:00', 2, 'pending', 'RES002']
    );

    // Orders
    await pool.query(
      'INSERT INTO orders (user_id, restaurant_id, status, total, customer_name) VALUES ($1, $2, $3, $4, $5)',
      [userIds['customer1@gmail.com'], restIds['The Nile View'], 'completed', '410.00', 'Fatma Ibrahim']
    );

    // Reviews
    await pool.query(
      'INSERT INTO reviews (user_id, restaurant_id, rating, comment) VALUES ($1, $2, $3, $4)',
      [userIds['customer1@gmail.com'], restIds['The Nile View'], 5, 'مطعم رائع!']
    );

    res.status(200).json({
      success: true,
      message: 'تم إضافة البيانات التجريبية!',
      credentials: {
        admin: { email: 'admin@eliterestaurant.com', password: 'password123' },
        owner: { email: 'owner1@eliterestaurant.com', password: 'password123' },
        customer: { email: 'customer1@gmail.com', password: 'password123' }
      }
    });
  } finally {
    await pool.end();
  }
}

// Main router
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = req.url || '';
  const path = url.split('?')[0];

  try {
    // Route matching
    if (path === '/api/health') return handleHealth(req, res);
    if (path === '/api/restaurants') return handleRestaurants(req, res);
    if (path === '/api/governorates') return handleGovernorates(req, res);
    if (path === '/api/districts') return handleDistricts(req, res);
    if (path === '/api/auth/me') return handleAuthMe(req, res);
    if (path === '/api/auth/login') return handleAuthLogin(req, res);
    if (path === '/api/auth/register') return handleAuthRegister(req, res);
    if (path === '/api/auth/logout') return handleAuthLogout(req, res);
    if (path === '/api/admin/stats') return handleAdminStats(req, res);
    if (path === '/api/admin/users') return handleAdminUsers(req, res);
    if (path === '/api/admin/restaurants') return handleAdminRestaurants(req, res);
    if (path === '/api/admin/reservations') return handleAdminReservations(req, res);
    if (path === '/api/admin/orders') return handleAdminOrders(req, res);
    if (path === '/api/admin/notifications') return handleAdminNotifications(req, res);
    if (path === '/api/admin/activity-logs') return handleAdminActivityLogs(req, res);
    if (path === '/api/admin/analytics/revenue') return handleAdminAnalyticsRevenue(req, res);
    if (path === '/api/admin/analytics/user-growth') return handleAdminAnalyticsUserGrowth(req, res);
    if (path === '/api/admin/analytics/top-restaurants') return handleAdminAnalyticsTopRestaurants(req, res);
    if (path === '/api/seed') return handleSeed(req, res);

    res.status(404).json({ error: 'Not found', path });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
  }
}
