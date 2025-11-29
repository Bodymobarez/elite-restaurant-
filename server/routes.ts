import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertRestaurantSchema, insertMenuItemSchema,
  insertReservationSchema, insertOrderSchema, loginSchema
} from "@shared/schema";
import { z } from "zod";
import { hash, compare } from "bcrypt";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ========== AUTH ROUTES ==========
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const existing = await storage.getUserByEmail(data.email);
      if (existing) {
        return res.status(400).json({ error: "Email already registered" });
      }
      const hashedPassword = await hash(data.password, 10);
      const allowedRole = data.role === "restaurant_owner" ? "restaurant_owner" : "customer";
      const user = await storage.createUser({ 
        ...data, 
        password: hashedPassword,
        role: allowedRole
      });
      const { password, ...userWithoutPassword } = user;
      req.session.userId = user.id;
      req.session.userRole = user.role;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to register" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const valid = await compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      req.session.userId = user.id;
      req.session.userRole = user.role;
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // ========== LOCATION ROUTES ==========
  app.get("/api/governorates", async (req, res) => {
    try {
      const govs = await storage.getGovernorates();
      res.json(govs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch governorates" });
    }
  });

  app.get("/api/governorates/:id/districts", async (req, res) => {
    try {
      const dists = await storage.getDistricts(req.params.id);
      res.json(dists);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch districts" });
    }
  });

  app.get("/api/districts", async (req, res) => {
    try {
      const governorateId = req.query.governorateId as string | undefined;
      const dists = await storage.getDistricts(governorateId);
      res.json(dists);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch districts" });
    }
  });

  // ========== RESTAURANT ROUTES ==========
  app.get("/api/restaurants", async (req, res) => {
    try {
      const governorateId = req.query.governorateId as string | undefined;
      const districtId = req.query.districtId as string | undefined;
      const restaurants = await storage.getRestaurants(governorateId, districtId);
      res.json(restaurants);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch restaurants" });
    }
  });

  app.get("/api/restaurants/:id", async (req, res) => {
    try {
      const restaurant = await storage.getRestaurant(req.params.id);
      if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
      }
      res.json(restaurant);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch restaurant" });
    }
  });

  app.post("/api/restaurants", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const data = insertRestaurantSchema.parse({ ...req.body, ownerId: req.session.userId });
      const restaurant = await storage.createRestaurant(data);
      res.json(restaurant);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create restaurant" });
    }
  });

  app.patch("/api/restaurants/:id", async (req, res) => {
    try {
      const restaurant = await storage.updateRestaurant(req.params.id, req.body);
      if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
      }
      res.json(restaurant);
    } catch (error) {
      res.status(500).json({ error: "Failed to update restaurant" });
    }
  });

  // Admin: Get all restaurants including pending
  app.get("/api/admin/restaurants", async (req, res) => {
    try {
      if (req.session.userRole !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      const { db } = await import("./db");
      const { restaurants } = await import("@shared/schema");
      const { desc } = await import("drizzle-orm");
      const allRestaurants = await db.select().from(restaurants).orderBy(desc(restaurants.createdAt));
      res.json(allRestaurants);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch restaurants" });
    }
  });

  // ========== MENU ROUTES ==========
  app.get("/api/restaurants/:id/menu", async (req, res) => {
    try {
      const items = await storage.getMenuItems(req.params.id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch menu items" });
    }
  });

  app.post("/api/menu-items", async (req, res) => {
    try {
      const data = insertMenuItemSchema.parse(req.body);
      const item = await storage.createMenuItem(data);
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create menu item" });
    }
  });

  app.patch("/api/menu-items/:id", async (req, res) => {
    try {
      const item = await storage.updateMenuItem(req.params.id, req.body);
      if (!item) {
        return res.status(404).json({ error: "Menu item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to update menu item" });
    }
  });

  app.delete("/api/menu-items/:id", async (req, res) => {
    try {
      await storage.deleteMenuItem(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete menu item" });
    }
  });

  // ========== RESERVATION ROUTES ==========
  app.get("/api/reservations", async (req, res) => {
    try {
      const userId = req.query.userId as string | undefined;
      const restaurantId = req.query.restaurantId as string | undefined;
      const reservations = await storage.getReservations(userId, restaurantId);
      res.json(reservations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reservations" });
    }
  });

  app.get("/api/reservations/:id", async (req, res) => {
    try {
      const reservation = await storage.getReservation(req.params.id);
      if (!reservation) {
        return res.status(404).json({ error: "Reservation not found" });
      }
      res.json(reservation);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reservation" });
    }
  });

  app.post("/api/reservations", async (req, res) => {
    try {
      const data = insertReservationSchema.parse(req.body);
      const reservation = await storage.createReservation(data);
      res.json(reservation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create reservation" });
    }
  });

  app.patch("/api/reservations/:id", async (req, res) => {
    try {
      const reservation = await storage.updateReservation(req.params.id, req.body);
      if (!reservation) {
        return res.status(404).json({ error: "Reservation not found" });
      }
      res.json(reservation);
    } catch (error) {
      res.status(500).json({ error: "Failed to update reservation" });
    }
  });

  // ========== ORDER ROUTES ==========
  app.get("/api/orders", async (req, res) => {
    try {
      const restaurantId = req.query.restaurantId as string | undefined;
      const orders = await storage.getOrders(restaurantId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const data = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(data);
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.updateOrder(req.params.id, req.body);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  // ========== FAVORITE ROUTES ==========
  app.get("/api/favorites", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const favorites = await storage.getFavorites(req.session.userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const { restaurantId } = req.body;
      const favorite = await storage.addFavorite({ userId: req.session.userId, restaurantId });
      res.json(favorite);
    } catch (error) {
      res.status(500).json({ error: "Failed to add favorite" });
    }
  });

  app.delete("/api/favorites/:restaurantId", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      await storage.removeFavorite(req.session.userId, req.params.restaurantId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove favorite" });
    }
  });

  // ========== ADMIN STATS ==========
  app.get("/api/admin/stats", async (req, res) => {
    try {
      if (req.session.userRole !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      const { db } = await import("./db");
      const { restaurants, users, orders, reservations } = await import("@shared/schema");
      const { count, eq, sql } = await import("drizzle-orm");
      
      const [restaurantCount] = await db.select({ count: count() }).from(restaurants);
      const [userCount] = await db.select({ count: count() }).from(users);
      const [orderCount] = await db.select({ count: count() }).from(orders);
      const [reservationCount] = await db.select({ count: count() }).from(reservations);
      const [pendingCount] = await db.select({ count: count() }).from(restaurants).where(eq(restaurants.status, "pending"));
      const [pendingReservations] = await db.select({ count: count() }).from(reservations).where(eq(reservations.status, "pending"));
      
      res.json({
        restaurants: restaurantCount.count,
        users: userCount.count,
        orders: orderCount.count,
        reservations: reservationCount.count,
        pendingApprovals: pendingCount.count,
        pendingReservations: pendingReservations.count
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // ========== ADMIN USER MANAGEMENT ==========
  app.get("/api/admin/users", async (req, res) => {
    try {
      if (req.session.userRole !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      const allUsers = await storage.getAllUsers();
      const usersWithoutPasswords = allUsers.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id", async (req, res) => {
    try {
      if (req.session.userRole !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      const { role } = req.body;
      if (role && !["customer", "restaurant_owner", "admin"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }
      const user = await storage.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      if (req.session.userRole !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      if (req.params.id === req.session.userId) {
        return res.status(400).json({ error: "Cannot delete yourself" });
      }
      await storage.deleteUser(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // ========== ADMIN RESERVATIONS ==========
  app.get("/api/admin/reservations", async (req, res) => {
    try {
      if (req.session.userRole !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      const allReservations = await storage.getReservations();
      res.json(allReservations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reservations" });
    }
  });

  app.patch("/api/admin/reservations/:id", async (req, res) => {
    try {
      if (req.session.userRole !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      const reservation = await storage.updateReservation(req.params.id, req.body);
      if (!reservation) {
        return res.status(404).json({ error: "Reservation not found" });
      }
      res.json(reservation);
    } catch (error) {
      res.status(500).json({ error: "Failed to update reservation" });
    }
  });

  // ========== ADMIN ORDERS ==========
  app.get("/api/admin/orders", async (req, res) => {
    try {
      if (req.session.userRole !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      const allOrders = await storage.getOrders();
      res.json(allOrders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.patch("/api/admin/orders/:id", async (req, res) => {
    try {
      if (req.session.userRole !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      const order = await storage.updateOrder(req.params.id, req.body);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  // ========== SEED DATA ROUTE ==========
  app.post("/api/seed", async (req, res) => {
    try {
      const hashedPassword = await hash("password123", 10);
      
      // Create Egyptian Governorates
      const cairo = await storage.createGovernorate({ name: "Cairo", nameAr: "القاهرة" });
      const giza = await storage.createGovernorate({ name: "Giza", nameAr: "الجيزة" });
      const alexandria = await storage.createGovernorate({ name: "Alexandria", nameAr: "الإسكندرية" });
      const redSea = await storage.createGovernorate({ name: "Red Sea", nameAr: "البحر الأحمر" });
      const southSinai = await storage.createGovernorate({ name: "South Sinai", nameAr: "جنوب سيناء" });

      // Cairo Districts
      const zamalek = await storage.createDistrict({ governorateId: cairo.id, name: "Zamalek", nameAr: "الزمالك" });
      const maadi = await storage.createDistrict({ governorateId: cairo.id, name: "Maadi", nameAr: "المعادي" });
      const heliopolis = await storage.createDistrict({ governorateId: cairo.id, name: "Heliopolis", nameAr: "مصر الجديدة" });
      const newCairo = await storage.createDistrict({ governorateId: cairo.id, name: "New Cairo", nameAr: "القاهرة الجديدة" });
      const gardenCity = await storage.createDistrict({ governorateId: cairo.id, name: "Garden City", nameAr: "جاردن سيتي" });
      const downtown = await storage.createDistrict({ governorateId: cairo.id, name: "Downtown", nameAr: "وسط البلد" });

      // Giza Districts
      const sheikh = await storage.createDistrict({ governorateId: giza.id, name: "Sheikh Zayed", nameAr: "الشيخ زايد" });
      const october = await storage.createDistrict({ governorateId: giza.id, name: "6th of October", nameAr: "السادس من أكتوبر" });
      const dokki = await storage.createDistrict({ governorateId: giza.id, name: "Dokki", nameAr: "الدقي" });
      const mohandessin = await storage.createDistrict({ governorateId: giza.id, name: "Mohandessin", nameAr: "المهندسين" });

      // Alexandria Districts
      const sanStefano = await storage.createDistrict({ governorateId: alexandria.id, name: "San Stefano", nameAr: "سان ستيفانو" });
      const stanley = await storage.createDistrict({ governorateId: alexandria.id, name: "Stanley", nameAr: "ستانلي" });
      const gleem = await storage.createDistrict({ governorateId: alexandria.id, name: "Gleem", nameAr: "جليم" });

      // Red Sea Districts
      const hurghada = await storage.createDistrict({ governorateId: redSea.id, name: "Hurghada", nameAr: "الغردقة" });
      const elGouna = await storage.createDistrict({ governorateId: redSea.id, name: "El Gouna", nameAr: "الجونة" });

      // South Sinai Districts
      const sharmElSheikh = await storage.createDistrict({ governorateId: southSinai.id, name: "Sharm El Sheikh", nameAr: "شرم الشيخ" });

      // Create admin user
      const admin = await storage.createUser({
        email: "admin@elite.com",
        password: hashedPassword,
        name: "مدير النظام",
        role: "admin"
      });

      // Create restaurant owner
      const owner = await storage.createUser({
        email: "owner@elite.com", 
        password: hashedPassword,
        name: "صاحب المطعم",
        role: "restaurant_owner"
      });

      // Create customer
      const customer = await storage.createUser({
        email: "user@elite.com",
        password: hashedPassword,
        name: "أحمد محمد",
        role: "customer"
      });

      // Famous Elite Restaurants in Egypt - Cairo
      const sequoia = await storage.createRestaurant({
        ownerId: owner.id,
        name: "Sequoia",
        cuisine: "Mediterranean & Oriental",
        description: "مطعم فاخر على ضفاف النيل بإطلالة ساحرة - One of Cairo's most iconic restaurants on the Nile",
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        address: "53 Abu El Feda St, Zamalek",
        governorateId: cairo.id,
        districtId: zamalek.id,
        phone: "+20 2 2735 0014",
        priceRange: "$$$$",
        status: "active"
      });

      const kazoku = await storage.createRestaurant({
        ownerId: owner.id,
        name: "Kazoku",
        cuisine: "Japanese Fine Dining",
        description: "مطبخ ياباني راقي مع أطباق السوشي والتيبانياكي - Premium Japanese cuisine with sushi and teppanyaki",
        image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
        address: "Four Seasons Nile Plaza, Garden City",
        governorateId: cairo.id,
        districtId: gardenCity.id,
        phone: "+20 2 2791 7000",
        priceRange: "$$$$",
        status: "active"
      });

      const steakHouse = await storage.createRestaurant({
        ownerId: owner.id,
        name: "The Steakhouse",
        cuisine: "American Steakhouse",
        description: "أفضل شرائح اللحم في القاهرة - Premium dry-aged steaks in an elegant setting",
        image: "https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        address: "JW Marriott, Mirage City, New Cairo",
        governorateId: cairo.id,
        districtId: newCairo.id,
        phone: "+20 2 2411 5588",
        priceRange: "$$$$",
        status: "active"
      });

      const nubia = await storage.createRestaurant({
        ownerId: owner.id,
        name: "Nubia Lounge",
        cuisine: "Egyptian & Nubian",
        description: "تجربة مصرية أصيلة مع المأكولات النوبية - Authentic Egyptian and Nubian cuisine experience",
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
        address: "Corniche El Nil, Maadi",
        governorateId: cairo.id,
        districtId: maadi.id,
        phone: "+20 2 2526 0000",
        priceRange: "$$$",
        status: "active"
      });

      const laCapitale = await storage.createRestaurant({
        ownerId: owner.id,
        name: "La Capitale",
        cuisine: "French Fine Dining",
        description: "المطبخ الفرنسي الراقي في قلب القاهرة - Exquisite French cuisine in the heart of Cairo",
        image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        address: "Sofitel Cairo Nile El Gezirah, Zamalek",
        governorateId: cairo.id,
        districtId: zamalek.id,
        phone: "+20 2 2737 3737",
        priceRange: "$$$$",
        status: "active"
      });

      // Sheikh Zayed Restaurants
      const maison = await storage.createRestaurant({
        ownerId: owner.id,
        name: "Maison Thomas",
        cuisine: "Italian & Mediterranean",
        description: "البيتزا والباستا الإيطالية الأصيلة - Authentic Italian pizza and pasta since 1922",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=1481&q=80",
        address: "Arkan Mall, Sheikh Zayed",
        governorateId: giza.id,
        districtId: sheikh.id,
        phone: "+20 2 3851 0000",
        priceRange: "$$$",
        status: "active"
      });

      const pier88 = await storage.createRestaurant({
        ownerId: owner.id,
        name: "Pier 88",
        cuisine: "Seafood",
        description: "أجود المأكولات البحرية الطازجة - Fresh premium seafood with Mediterranean flair",
        image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
        address: "CityScape Mall, 6th of October",
        governorateId: giza.id,
        districtId: october.id,
        phone: "+20 2 3827 0088",
        priceRange: "$$$$",
        status: "active"
      });

      // Alexandria Restaurants
      const balbaa = await storage.createRestaurant({
        ownerId: owner.id,
        name: "Balbaa Village",
        cuisine: "Seafood & Grills",
        description: "المأكولات البحرية الطازجة من البحر مباشرة - Fresh seafood straight from the Mediterranean",
        image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
        address: "San Stefano Grand Plaza, Alexandria",
        governorateId: alexandria.id,
        districtId: sanStefano.id,
        phone: "+20 3 469 0000",
        priceRange: "$$$",
        status: "active"
      });

      const fishMarket = await storage.createRestaurant({
        ownerId: owner.id,
        name: "Fish Market",
        cuisine: "Seafood",
        description: "اختر سمكتك وسنطهيها لك - Pick your fish and we'll cook it your way",
        image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
        address: "Corniche, Stanley, Alexandria",
        governorateId: alexandria.id,
        districtId: stanley.id,
        phone: "+20 3 545 0000",
        priceRange: "$$$",
        status: "active"
      });

      // Red Sea Restaurants
      const moby = await storage.createRestaurant({
        ownerId: owner.id,
        name: "Moby Dick",
        cuisine: "Seafood & International",
        description: "مطعم بحري فاخر على البحر الأحمر - Premium seafood restaurant on the Red Sea",
        image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
        address: "El Gouna Marina",
        governorateId: redSea.id,
        districtId: elGouna.id,
        phone: "+20 65 358 0000",
        priceRange: "$$$$",
        status: "active"
      });

      // Sharm El Sheikh
      const la = await storage.createRestaurant({
        ownerId: owner.id,
        name: "La Luna",
        cuisine: "Italian Fine Dining",
        description: "المطبخ الإيطالي الراقي مع إطلالة على البحر - Fine Italian dining with sea views",
        image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        address: "Naama Bay, Sharm El Sheikh",
        governorateId: southSinai.id,
        districtId: sharmElSheikh.id,
        phone: "+20 69 360 0000",
        priceRange: "$$$$",
        status: "active"
      });

      // Pending restaurant
      const pending = await storage.createRestaurant({
        ownerId: owner.id,
        name: "Kempinski Nile",
        cuisine: "International",
        description: "مطعم فندقي فاخر قيد المراجعة - Luxury hotel restaurant pending approval",
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        address: "Kempinski Nile Hotel, Garden City",
        governorateId: cairo.id,
        districtId: gardenCity.id,
        phone: "+20 2 2798 0000",
        priceRange: "$$$$",
        status: "pending"
      });

      // Create menu items for Sequoia (EGP prices)
      await storage.createMenuItem({
        restaurantId: sequoia.id,
        name: "Mixed Grills Platter",
        description: "طبق مشويات مشكلة فاخر - Premium mixed grill selection",
        price: "850",
        category: "Main Courses",
        image: "https://images.unsplash.com/photo-1544025162-d76978cde07a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        available: true
      });

      await storage.createMenuItem({
        restaurantId: sequoia.id,
        name: "Hummus Beiruti",
        description: "حمص على الطريقة اللبنانية - Traditional Lebanese hummus",
        price: "180",
        category: "Appetizers",
        image: "https://images.unsplash.com/photo-1577805947697-89e18249d767?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        available: true
      });

      await storage.createMenuItem({
        restaurantId: sequoia.id,
        name: "Grilled Sea Bass",
        description: "قاروص مشوي مع الأعشاب - Grilled sea bass with herbs",
        price: "650",
        category: "Seafood",
        image: "https://images.unsplash.com/photo-1519708227418-c8fd9a3a27cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        available: true
      });

      await storage.createMenuItem({
        restaurantId: sequoia.id,
        name: "Kunafa",
        description: "كنافة بالقشطة والفستق - Traditional kunafa with cream and pistachios",
        price: "220",
        category: "Desserts",
        image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1364&q=80",
        available: true
      });

      // Create menu items for Kazoku (Japanese - EGP prices)
      await storage.createMenuItem({
        restaurantId: kazoku.id,
        name: "Omakase Sushi",
        description: "تشكيلة سوشي من اختيار الشيف - Chef's selection sushi platter",
        price: "1200",
        category: "Sushi",
        image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        available: true
      });

      await storage.createMenuItem({
        restaurantId: kazoku.id,
        name: "Wagyu Teppanyaki",
        description: "لحم واغيو على الصاج الياباني - Premium Wagyu beef on hot plate",
        price: "1800",
        category: "Teppanyaki",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        available: true
      });

      await storage.createMenuItem({
        restaurantId: kazoku.id,
        name: "Dragon Roll",
        description: "رول التنين مع الأفوكادو وسمك الأنقليس - Dragon roll with avocado and eel",
        price: "450",
        category: "Sushi",
        image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        available: true
      });

      await storage.createMenuItem({
        restaurantId: kazoku.id,
        name: "Mochi Ice Cream",
        description: "آيس كريم موتشي ياباني - Japanese mochi ice cream",
        price: "180",
        category: "Desserts",
        image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1364&q=80",
        available: true
      });

      // Create menu items for The Steakhouse (EGP prices)
      await storage.createMenuItem({
        restaurantId: steakHouse.id,
        name: "Ribeye Steak 400g",
        description: "ريب آي ستيك معتق - Dry-aged ribeye steak",
        price: "1400",
        category: "Steaks",
        image: "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        available: true
      });

      await storage.createMenuItem({
        restaurantId: steakHouse.id,
        name: "Filet Mignon 300g",
        description: "فيليه مينيون طري - Tender filet mignon",
        price: "1600",
        category: "Steaks",
        image: "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        available: true
      });

      await storage.createMenuItem({
        restaurantId: steakHouse.id,
        name: "Caesar Salad",
        description: "سلطة سيزر الكلاسيكية - Classic Caesar salad",
        price: "220",
        category: "Starters",
        image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        available: true
      });

      res.json({ success: true, message: "تم إنشاء البيانات بنجاح - Egyptian seed data created successfully" });
    } catch (error) {
      console.error("Seed error:", error);
      res.status(500).json({ error: "Failed to seed data" });
    }
  });

  return httpServer;
}
