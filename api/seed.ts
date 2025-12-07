import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool, neonConfig } from '@neondatabase/serverless';
import bcrypt from 'bcrypt';
import ws from 'ws';

if (typeof globalThis.WebSocket === 'undefined') {
  neonConfig.webSocketConstructor = ws;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST to seed data.' });
  }

  try {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      return res.status(500).json({ error: 'DATABASE_URL not set' });
    }

    const pool = new Pool({ connectionString });

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Clear existing data (optional - comment out if you want to keep existing data)
    await pool.query('DELETE FROM order_items');
    await pool.query('DELETE FROM orders');
    await pool.query('DELETE FROM reservations');
    await pool.query('DELETE FROM reviews');
    await pool.query('DELETE FROM favorites');
    await pool.query('DELETE FROM menu_items');
    await pool.query('DELETE FROM restaurants');
    await pool.query('DELETE FROM notifications');
    await pool.query('DELETE FROM activity_logs');
    await pool.query('DELETE FROM users WHERE role != $1', ['admin']);
    await pool.query('DELETE FROM districts');
    await pool.query('DELETE FROM governorates');

    // 2. Insert Governorates
    const governoratesData = [
      { name: 'Cairo', nameAr: 'القاهرة' },
      { name: 'Giza', nameAr: 'الجيزة' },
      { name: 'Alexandria', nameAr: 'الإسكندرية' },
      { name: 'Dakahlia', nameAr: 'الدقهلية' },
      { name: 'Red Sea', nameAr: 'البحر الأحمر' },
    ];

    const governorateIds: Record<string, string> = {};
    for (const gov of governoratesData) {
      const result = await pool.query(
        'INSERT INTO governorates (name, name_ar) VALUES ($1, $2) RETURNING id',
        [gov.name, gov.nameAr]
      );
      governorateIds[gov.name] = result.rows[0].id;
    }

    // 3. Insert Districts
    const districtsData = [
      { governorate: 'Cairo', name: 'Nasr City', nameAr: 'مدينة نصر' },
      { governorate: 'Cairo', name: 'Heliopolis', nameAr: 'مصر الجديدة' },
      { governorate: 'Cairo', name: 'Maadi', nameAr: 'المعادي' },
      { governorate: 'Cairo', name: 'Zamalek', nameAr: 'الزمالك' },
      { governorate: 'Cairo', name: 'Downtown', nameAr: 'وسط البلد' },
      { governorate: 'Giza', name: 'Dokki', nameAr: 'الدقي' },
      { governorate: 'Giza', name: 'Mohandessin', nameAr: 'المهندسين' },
      { governorate: 'Giza', name: '6th of October', nameAr: '6 أكتوبر' },
      { governorate: 'Giza', name: 'Sheikh Zayed', nameAr: 'الشيخ زايد' },
      { governorate: 'Alexandria', name: 'Montaza', nameAr: 'المنتزه' },
      { governorate: 'Alexandria', name: 'Sidi Gaber', nameAr: 'سيدي جابر' },
      { governorate: 'Alexandria', name: 'Stanley', nameAr: 'ستانلي' },
    ];

    const districtIds: Record<string, string> = {};
    for (const dist of districtsData) {
      const result = await pool.query(
        'INSERT INTO districts (governorate_id, name, name_ar) VALUES ($1, $2, $3) RETURNING id',
        [governorateIds[dist.governorate], dist.name, dist.nameAr]
      );
      districtIds[dist.name] = result.rows[0].id;
    }

    // 4. Insert Users
    const usersData = [
      { email: 'admin@eliterestaurant.com', name: 'Admin User', role: 'admin', phone: '+201000000001' },
      { email: 'owner1@eliterestaurant.com', name: 'Ahmed Hassan', role: 'restaurant_owner', phone: '+201000000002' },
      { email: 'owner2@eliterestaurant.com', name: 'Mohamed Ali', role: 'restaurant_owner', phone: '+201000000003' },
      { email: 'owner3@eliterestaurant.com', name: 'Sara Mahmoud', role: 'restaurant_owner', phone: '+201000000004' },
      { email: 'customer1@gmail.com', name: 'Fatma Ibrahim', role: 'customer', phone: '+201000000005' },
      { email: 'customer2@gmail.com', name: 'Omar Khaled', role: 'customer', phone: '+201000000006' },
      { email: 'customer3@gmail.com', name: 'Nour Ahmed', role: 'customer', phone: '+201000000007' },
      { email: 'customer4@gmail.com', name: 'Youssef Tarek', role: 'customer', phone: '+201000000008' },
      { email: 'customer5@gmail.com', name: 'Mona Samir', role: 'customer', phone: '+201000000009' },
    ];

    const userIds: Record<string, string> = {};
    for (const user of usersData) {
      const result = await pool.query(
        'INSERT INTO users (email, password, name, role, phone) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO UPDATE SET name = $3 RETURNING id',
        [user.email, hashedPassword, user.name, user.role, user.phone]
      );
      userIds[user.email] = result.rows[0].id;
    }

    // 5. Insert Restaurants
    const restaurantsData = [
      {
        owner: 'owner1@eliterestaurant.com',
        name: 'The Nile View',
        cuisine: 'Egyptian',
        description: 'مطعم فاخر يطل على النيل مع أفضل المأكولات المصرية الأصيلة',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
        address: '15 Corniche El Nile, Garden City',
        governorate: 'Cairo',
        district: 'Downtown',
        phone: '+20223456789',
        email: 'info@nileview.com',
        priceRange: '$$$$',
        rating: '4.8',
        status: 'active'
      },
      {
        owner: 'owner1@eliterestaurant.com',
        name: 'Kebabgy',
        cuisine: 'Grills',
        description: 'أشهى المشويات والكباب على الفحم بالطريقة المصرية الأصيلة',
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
        address: '45 Abbas El Akkad, Nasr City',
        governorate: 'Cairo',
        district: 'Nasr City',
        phone: '+20224567890',
        email: 'info@kebabgy.com',
        priceRange: '$$$',
        rating: '4.6',
        status: 'active'
      },
      {
        owner: 'owner2@eliterestaurant.com',
        name: 'Sushi Master',
        cuisine: 'Japanese',
        description: 'أفضل السوشي الياباني في مصر مع شيف ياباني متخصص',
        image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800',
        address: '88 Tahrir Street, Dokki',
        governorate: 'Giza',
        district: 'Dokki',
        phone: '+20235678901',
        email: 'info@sushimaster.com',
        priceRange: '$$$$',
        rating: '4.7',
        status: 'active'
      },
      {
        owner: 'owner2@eliterestaurant.com',
        name: 'Pasta Palace',
        cuisine: 'Italian',
        description: 'المطبخ الإيطالي الأصيل من باستا وبيتزا ومقبلات',
        image: 'https://images.unsplash.com/photo-1481931098730-318b6f776db0?w=800',
        address: '120 Syria Street, Mohandessin',
        governorate: 'Giza',
        district: 'Mohandessin',
        phone: '+20236789012',
        email: 'info@pastapalace.com',
        priceRange: '$$$',
        rating: '4.5',
        status: 'active'
      },
      {
        owner: 'owner3@eliterestaurant.com',
        name: 'Seafood House',
        cuisine: 'Seafood',
        description: 'أطازج المأكولات البحرية من البحر المتوسط مباشرة',
        image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800',
        address: '33 Corniche Road, Stanley',
        governorate: 'Alexandria',
        district: 'Stanley',
        phone: '+20347890123',
        email: 'info@seafoodhouse.com',
        priceRange: '$$$$',
        rating: '4.9',
        status: 'active'
      },
      {
        owner: 'owner3@eliterestaurant.com',
        name: 'Burger Lab',
        cuisine: 'American',
        description: 'برجر جورميه مع أفضل المكونات الطازجة',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
        address: '55 Road 9, Maadi',
        governorate: 'Cairo',
        district: 'Maadi',
        phone: '+20225678901',
        email: 'info@burgerlab.com',
        priceRange: '$$',
        rating: '4.4',
        status: 'active'
      },
      {
        owner: 'owner1@eliterestaurant.com',
        name: 'Foul & Falafel House',
        cuisine: 'Egyptian',
        description: 'أشهى الفول والفلافل المصري على الإفطار والغداء',
        image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
        address: '10 El Baron Street, Heliopolis',
        governorate: 'Cairo',
        district: 'Heliopolis',
        phone: '+20226789012',
        email: 'info@foulhouse.com',
        priceRange: '$',
        rating: '4.3',
        status: 'active'
      },
      {
        owner: 'owner2@eliterestaurant.com',
        name: 'Le Petit Paris',
        cuisine: 'French',
        description: 'المطبخ الفرنسي الراقي في قلب الزمالك',
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
        address: '26 July Street, Zamalek',
        governorate: 'Cairo',
        district: 'Zamalek',
        phone: '+20227890123',
        email: 'info@lepetitparis.com',
        priceRange: '$$$$',
        rating: '4.8',
        status: 'active'
      },
    ];

    const restaurantIds: Record<string, string> = {};
    for (const rest of restaurantsData) {
      const result = await pool.query(
        `INSERT INTO restaurants (owner_id, name, cuisine, description, image, address, governorate_id, district_id, phone, email, price_range, rating, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
        [
          userIds[rest.owner],
          rest.name,
          rest.cuisine,
          rest.description,
          rest.image,
          rest.address,
          governorateIds[rest.governorate],
          districtIds[rest.district],
          rest.phone,
          rest.email,
          rest.priceRange,
          rest.rating,
          rest.status
        ]
      );
      restaurantIds[rest.name] = result.rows[0].id;
    }

    // 6. Insert Menu Items
    const menuItemsData = [
      // The Nile View
      { restaurant: 'The Nile View', name: 'كشري', description: 'كشري مصري أصيل مع الصلصة الحارة', price: '45.00', category: 'Main Course', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
      { restaurant: 'The Nile View', name: 'ملوخية بالأرانب', description: 'ملوخية خضراء مع أرانب محمرة', price: '180.00', category: 'Main Course', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400' },
      { restaurant: 'The Nile View', name: 'فتة لحمة', description: 'فتة باللحم البلدي والخل والثوم', price: '150.00', category: 'Main Course', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400' },
      { restaurant: 'The Nile View', name: 'سلطة بلدي', description: 'طماطم وخيار وجرجير', price: '35.00', category: 'Appetizers', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400' },
      
      // Kebabgy
      { restaurant: 'Kebabgy', name: 'كباب مشوي', description: 'كباب لحم بقري مشوي على الفحم', price: '120.00', category: 'Main Course', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400' },
      { restaurant: 'Kebabgy', name: 'كفتة مشوية', description: 'كفتة لحم مشوية مع البهارات', price: '100.00', category: 'Main Course', image: 'https://images.unsplash.com/photo-1529694157872-4e0c0f3b238b?w=400' },
      { restaurant: 'Kebabgy', name: 'ريش ضاني', description: 'ريش ضاني مشوية على الفحم', price: '200.00', category: 'Main Course', image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400' },
      { restaurant: 'Kebabgy', name: 'طحينة', description: 'طحينة طازجة مع الليمون', price: '25.00', category: 'Appetizers', image: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400' },
      
      // Sushi Master
      { restaurant: 'Sushi Master', name: 'سلمون رول', description: 'رول سوشي بالسلمون الطازج', price: '180.00', category: 'Sushi', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400' },
      { restaurant: 'Sushi Master', name: 'تونا ساشيمي', description: 'شرائح التونا الطازجة', price: '220.00', category: 'Sashimi', image: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400' },
      { restaurant: 'Sushi Master', name: 'دراجون رول', description: 'رول بالجمبري والأفوكادو', price: '200.00', category: 'Sushi', image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400' },
      
      // Pasta Palace
      { restaurant: 'Pasta Palace', name: 'سباجيتي بولونيز', description: 'سباجيتي مع صوص اللحم المفروم', price: '95.00', category: 'Pasta', image: 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=400' },
      { restaurant: 'Pasta Palace', name: 'بيتزا مارجريتا', description: 'بيتزا بالجبن والطماطم والريحان', price: '120.00', category: 'Pizza', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400' },
      { restaurant: 'Pasta Palace', name: 'لازانيا', description: 'لازانيا باللحم والبشاميل', price: '130.00', category: 'Pasta', image: 'https://images.unsplash.com/photo-1560684352-8497838a2229?w=400' },
      
      // Seafood House
      { restaurant: 'Seafood House', name: 'جمبري مشوي', description: 'جمبري جامبو مشوي بالثوم والليمون', price: '280.00', category: 'Main Course', image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400' },
      { restaurant: 'Seafood House', name: 'سمك قاروص', description: 'سمك قاروص مشوي كامل', price: '320.00', category: 'Main Course', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400' },
      { restaurant: 'Seafood House', name: 'كاليماري مقلي', description: 'حلقات الكاليماري المقرمشة', price: '150.00', category: 'Appetizers', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400' },
      
      // Burger Lab
      { restaurant: 'Burger Lab', name: 'كلاسيك برجر', description: 'برجر لحم مع جبن شيدر', price: '85.00', category: 'Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
      { restaurant: 'Burger Lab', name: 'مشروم برجر', description: 'برجر مع مشروم سوتيه وجبن سويسري', price: '110.00', category: 'Burgers', image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400' },
      { restaurant: 'Burger Lab', name: 'بطاطس محمرة', description: 'بطاطس مقلية مقرمشة', price: '35.00', category: 'Sides', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400' },
    ];

    for (const item of menuItemsData) {
      await pool.query(
        `INSERT INTO menu_items (restaurant_id, name, description, price, category, image)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [restaurantIds[item.restaurant], item.name, item.description, item.price, item.category, item.image]
      );
    }

    // 7. Insert Reservations
    const today = new Date();
    const reservationsData = [
      { user: 'customer1@gmail.com', restaurant: 'The Nile View', date: formatDate(addDays(today, 1)), time: '19:00', partySize: 4, status: 'confirmed' },
      { user: 'customer2@gmail.com', restaurant: 'Sushi Master', date: formatDate(addDays(today, 2)), time: '20:00', partySize: 2, status: 'pending' },
      { user: 'customer3@gmail.com', restaurant: 'Seafood House', date: formatDate(addDays(today, 3)), time: '21:00', partySize: 6, status: 'confirmed' },
      { user: 'customer4@gmail.com', restaurant: 'Le Petit Paris', date: formatDate(addDays(today, -1)), time: '19:30', partySize: 2, status: 'completed' },
      { user: 'customer5@gmail.com', restaurant: 'Kebabgy', date: formatDate(addDays(today, 4)), time: '18:00', partySize: 8, status: 'pending' },
      { user: 'customer1@gmail.com', restaurant: 'Pasta Palace', date: formatDate(addDays(today, -2)), time: '20:30', partySize: 3, status: 'completed' },
      { user: 'customer2@gmail.com', restaurant: 'Burger Lab', date: formatDate(today), time: '13:00', partySize: 2, status: 'confirmed' },
    ];

    const reservationIds: Record<string, string> = {};
    for (let i = 0; i < reservationsData.length; i++) {
      const res = reservationsData[i];
      const confirmationCode = `RES${String(i + 1).padStart(6, '0')}`;
      const result = await pool.query(
        `INSERT INTO reservations (user_id, restaurant_id, date, time, party_size, status, confirmation_code)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [userIds[res.user], restaurantIds[res.restaurant], res.date, res.time, res.partySize, res.status, confirmationCode]
      );
      reservationIds[`${res.user}-${res.restaurant}`] = result.rows[0].id;
    }

    // 8. Insert Orders
    const ordersData = [
      { user: 'customer1@gmail.com', restaurant: 'The Nile View', status: 'completed', total: '410.00' },
      { user: 'customer2@gmail.com', restaurant: 'Sushi Master', status: 'preparing', total: '600.00' },
      { user: 'customer3@gmail.com', restaurant: 'Burger Lab', status: 'served', total: '230.00' },
      { user: 'customer4@gmail.com', restaurant: 'Pasta Palace', status: 'completed', total: '345.00' },
      { user: 'customer5@gmail.com', restaurant: 'Seafood House', status: 'ready', total: '750.00' },
    ];

    for (const order of ordersData) {
      await pool.query(
        `INSERT INTO orders (user_id, restaurant_id, status, total, customer_name)
         VALUES ($1, $2, $3, $4, $5)`,
        [userIds[order.user], restaurantIds[order.restaurant], order.status, order.total, usersData.find(u => u.email === order.user)?.name]
      );
    }

    // 9. Insert Reviews
    const reviewsData = [
      { user: 'customer1@gmail.com', restaurant: 'The Nile View', rating: 5, comment: 'مطعم رائع جداً والإطلالة على النيل مذهلة!' },
      { user: 'customer2@gmail.com', restaurant: 'The Nile View', rating: 4, comment: 'الأكل ممتاز والخدمة جيدة' },
      { user: 'customer3@gmail.com', restaurant: 'Sushi Master', rating: 5, comment: 'أفضل سوشي في مصر بدون منازع' },
      { user: 'customer4@gmail.com', restaurant: 'Seafood House', rating: 5, comment: 'السمك طازج جداً والجمبري لذيذ' },
      { user: 'customer5@gmail.com', restaurant: 'Burger Lab', rating: 4, comment: 'برجر لذيذ جداً وسعر معقول' },
      { user: 'customer1@gmail.com', restaurant: 'Kebabgy', rating: 5, comment: 'أحسن كباب في القاهرة!' },
      { user: 'customer2@gmail.com', restaurant: 'Le Petit Paris', rating: 5, comment: 'أجواء رومانسية وأكل فرنسي راقي' },
    ];

    for (const review of reviewsData) {
      await pool.query(
        `INSERT INTO reviews (user_id, restaurant_id, rating, comment)
         VALUES ($1, $2, $3, $4)`,
        [userIds[review.user], restaurantIds[review.restaurant], review.rating, review.comment]
      );
    }

    // 10. Insert Activity Logs
    const activityLogsData = [
      { user: 'admin@eliterestaurant.com', type: 'restaurant_approved', description: 'تمت الموافقة على مطعم The Nile View' },
      { user: 'customer1@gmail.com', type: 'reservation_created', description: 'حجز جديد في مطعم The Nile View' },
      { user: 'owner1@eliterestaurant.com', type: 'restaurant_created', description: 'تم إنشاء مطعم Kebabgy' },
      { user: 'customer2@gmail.com', type: 'order_created', description: 'طلب جديد في مطعم Sushi Master' },
    ];

    for (const log of activityLogsData) {
      await pool.query(
        `INSERT INTO activity_logs (user_id, activity_type, description)
         VALUES ($1, $2, $3)`,
        [userIds[log.user], log.type, log.description]
      );
    }

    // 11. Insert Notifications
    const notificationsData = [
      { user: 'admin@eliterestaurant.com', type: 'info', title: 'مطعم جديد', message: 'تم تسجيل مطعم جديد بانتظار الموافقة' },
      { user: 'customer1@gmail.com', type: 'success', title: 'تأكيد الحجز', message: 'تم تأكيد حجزك في مطعم The Nile View' },
      { user: 'owner1@eliterestaurant.com', type: 'info', title: 'حجز جديد', message: 'لديك حجز جديد اليوم الساعة 7 مساءً' },
    ];

    for (const notif of notificationsData) {
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message)
         VALUES ($1, $2, $3, $4)`,
        [userIds[notif.user], notif.type, notif.title, notif.message]
      );
    }

    // 12. Insert Favorites
    const favoritesData = [
      { user: 'customer1@gmail.com', restaurant: 'The Nile View' },
      { user: 'customer1@gmail.com', restaurant: 'Sushi Master' },
      { user: 'customer2@gmail.com', restaurant: 'Seafood House' },
      { user: 'customer3@gmail.com', restaurant: 'Le Petit Paris' },
      { user: 'customer4@gmail.com', restaurant: 'Burger Lab' },
    ];

    for (const fav of favoritesData) {
      await pool.query(
        `INSERT INTO favorites (user_id, restaurant_id)
         VALUES ($1, $2)`,
        [userIds[fav.user], restaurantIds[fav.restaurant]]
      );
    }

    await pool.end();

    res.status(200).json({
      success: true,
      message: 'تم إضافة البيانات التجريبية بنجاح!',
      data: {
        governorates: governoratesData.length,
        districts: districtsData.length,
        users: usersData.length,
        restaurants: restaurantsData.length,
        menuItems: menuItemsData.length,
        reservations: reservationsData.length,
        orders: ordersData.length,
        reviews: reviewsData.length,
        activityLogs: activityLogsData.length,
        notifications: notificationsData.length,
        favorites: favoritesData.length
      },
      credentials: {
        admin: { email: 'admin@eliterestaurant.com', password: 'password123' },
        restaurantOwner: { email: 'owner1@eliterestaurant.com', password: 'password123' },
        customer: { email: 'customer1@gmail.com', password: 'password123' }
      }
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({
      error: 'Failed to seed data',
      details: (error as Error).message
    });
  }
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
