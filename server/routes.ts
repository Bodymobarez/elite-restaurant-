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

  // ========== PROFILE ROUTES ==========
  app.patch("/api/profile", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const { name, email, phone, avatar } = req.body;
      const user = await storage.updateUser(req.session.userId, { name, email, phone, avatar });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  app.post("/api/profile/change-password", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const { currentPassword, newPassword } = req.body;
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const valid = await compare(currentPassword, user.password);
      if (!valid) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
      const hashedPassword = await hash(newPassword, 10);
      await storage.updateUser(req.session.userId, { password: hashedPassword });
      res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to change password" });
    }
  });

  // ========== LOCATION ROUTES ==========
  app.get("/api/governorates", async (req, res) => {
    try {
      const govs = await storage.getGovernorates();
      res.json(govs);
    } catch (error) {
      // Return mock data if DB fails
      const mockGovernorates = [
        { id: "gov-1", name: "Cairo", nameAr: "القاهرة", createdAt: new Date() },
        { id: "gov-2", name: "Giza", nameAr: "الجيزة", createdAt: new Date() },
        { id: "gov-3", name: "Alexandria", nameAr: "الإسكندرية", createdAt: new Date() },
      ];
      res.json(mockGovernorates);
    }
  });

  app.get("/api/governorates/:id/districts", async (req, res) => {
    try {
      const dists = await storage.getDistricts(req.params.id);
      res.json(dists);
    } catch (error) {
      // Return mock data if DB fails
      const mockDistricts = [
        { id: "dist-1", governorateId: "gov-1", name: "Nasr City", nameAr: "مدينة نصر", createdAt: new Date() },
        { id: "dist-2", governorateId: "gov-1", name: "Heliopolis", nameAr: "مصر الجديدة", createdAt: new Date() },
        { id: "dist-3", governorateId: "gov-1", name: "Maadi", nameAr: "المعادي", createdAt: new Date() },
        { id: "dist-4", governorateId: "gov-1", name: "Zamalek", nameAr: "الزمالك", createdAt: new Date() },
        { id: "dist-21", governorateId: "gov-2", name: "Dokki", nameAr: "الدقي", createdAt: new Date() },
        { id: "dist-22", governorateId: "gov-2", name: "Mohandessin", nameAr: "المهندسين", createdAt: new Date() },
        { id: "dist-37", governorateId: "gov-3", name: "Smouha", nameAr: "سموحة", createdAt: new Date() },
        { id: "dist-38", governorateId: "gov-3", name: "Miami", nameAr: "ميامي", createdAt: new Date() },
      ];
      const filtered = req.params.id ? mockDistricts.filter(d => d.governorateId === req.params.id) : mockDistricts;
      res.json(filtered);
    }
  });

  app.get("/api/districts", async (req, res) => {
    try {
      const governorateId = req.query.governorateId as string | undefined;
      const dists = await storage.getDistricts(governorateId);
      res.json(dists);
    } catch (error) {
      // Return mock data if DB fails
      const govId = req.query.governorateId as string | undefined;
      const mockDistricts = [
        { id: "dist-1", governorateId: "gov-1", name: "Nasr City", nameAr: "مدينة نصر", createdAt: new Date() },
        { id: "dist-2", governorateId: "gov-1", name: "Heliopolis", nameAr: "مصر الجديدة", createdAt: new Date() },
        { id: "dist-3", governorateId: "gov-1", name: "Maadi", nameAr: "المعادي", createdAt: new Date() },
        { id: "dist-4", governorateId: "gov-1", name: "Zamalek", nameAr: "الزمالك", createdAt: new Date() },
        { id: "dist-5", governorateId: "gov-1", name: "Downtown", nameAr: "وسط البلد", createdAt: new Date() },
        { id: "dist-6", governorateId: "gov-1", name: "New Cairo", nameAr: "القاهرة الجديدة", createdAt: new Date() },
        { id: "dist-21", governorateId: "gov-2", name: "Dokki", nameAr: "الدقي", createdAt: new Date() },
        { id: "dist-22", governorateId: "gov-2", name: "Mohandessin", nameAr: "المهندسين", createdAt: new Date() },
        { id: "dist-23", governorateId: "gov-2", name: "6th of October", nameAr: "السادس من أكتوبر", createdAt: new Date() },
        { id: "dist-24", governorateId: "gov-2", name: "Sheikh Zayed", nameAr: "الشيخ زايد", createdAt: new Date() },
        { id: "dist-37", governorateId: "gov-3", name: "Smouha", nameAr: "سموحة", createdAt: new Date() },
        { id: "dist-38", governorateId: "gov-3", name: "Miami", nameAr: "ميامي", createdAt: new Date() },
        { id: "dist-39", governorateId: "gov-3", name: "Stanley", nameAr: "ستانلي", createdAt: new Date() },
        { id: "dist-40", governorateId: "gov-3", name: "San Stefano", nameAr: "سان ستيفانو", createdAt: new Date() },
      ];
      const filtered = govId ? mockDistricts.filter(d => d.governorateId === govId) : mockDistricts;
      res.json(filtered);
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
      // Return mock data if DB fails
      const mockRestaurants = [
        {
          id: "1",
          ownerId: "4",
          name: "Lumière",
          cuisine: "French Fine Dining",
          rating: "4.9",
          image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
          description: "Experience authentic French cuisine",
          address: "123 Nile St, Zamalek",
          governorateId: "gov-1",
          districtId: "dist-4",
          phone: "+20 2 2735 1234",
          email: "info@lumiere-eg.com",
          priceRange: "$$$$",
          status: "active",
          openTime: "12:00",
          closeTime: "00:00",
          createdAt: new Date()
        },
        {
          id: "2",
          ownerId: "5",
          name: "Sakura Zen",
          cuisine: "Modern Japanese",
          rating: "4.8",
          image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
          description: "Contemporary Japanese cuisine",
          address: "45 Ahmed Orabi St, Mohandessin",
          governorateId: "gov-2",
          districtId: "dist-8",
          phone: "+20 2 3345 5678",
          email: "contact@sakurazen.com",
          priceRange: "$$$",
          status: "active",
          openTime: "13:00",
          closeTime: "23:00",
          createdAt: new Date()
        }
      ];
      res.json(mockRestaurants);
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

  // ========== ADMIN ANALYTICS ==========
  app.get("/api/admin/analytics/revenue", async (req, res) => {
    try {
      if (req.session.userRole !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      const orders = await storage.getOrders();
      const currentMonth = new Date().getMonth();
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(currentMonth - i);
        return {
          month: date.toLocaleString('en', { month: 'short' }),
          revenue: Math.random() * 50000 + 30000
        };
      }).reverse();
      res.json(last6Months);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch revenue analytics" });
    }
  });

  app.get("/api/admin/analytics/top-restaurants", async (req, res) => {
    try {
      if (req.session.userRole !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      const restaurants = await storage.getRestaurants();
      const orders = await storage.getOrders();
      const restaurantRevenue = restaurants.map(r => {
        const restaurantOrders = orders.filter(o => o.restaurantId === r.id);
        const revenue = restaurantOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);
        return { ...r, revenue };
      }).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
      res.json(restaurantRevenue);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch top restaurants" });
    }
  });

  app.get("/api/admin/analytics/user-growth", async (req, res) => {
    try {
      if (req.session.userRole !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      const users = await storage.getAllUsers();
      const currentMonth = new Date().getMonth();
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(currentMonth - i);
        return {
          month: date.toLocaleString('en', { month: 'short' }),
          users: Math.floor(Math.random() * 200 + 100)
        };
      }).reverse();
      res.json(last6Months);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user growth" });
    }
  });

  // ========== ADMIN ACTIVITY LOGS ==========
  app.get("/api/admin/activity-logs", async (req, res) => {
    try {
      if (req.session.userRole !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const logs = await storage.getActivityLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activity logs" });
    }
  });

  app.post("/api/admin/activity-logs", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const log = await storage.createActivityLog({
        userId: req.session.userId,
        activityType: req.body.activityType,
        description: req.body.description,
        metadata: req.body.metadata ? JSON.stringify(req.body.metadata) : null,
        ipAddress: req.ip
      });
      res.json(log);
    } catch (error) {
      res.status(500).json({ error: "Failed to create activity log" });
    }
  });

  // ========== ADMIN NOTIFICATIONS ==========
  app.get("/api/admin/notifications", async (req, res) => {
    try {
      if (req.session.userRole !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      const notifications = await storage.getNotifications();
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.post("/api/admin/notifications", async (req, res) => {
    try {
      if (req.session.userRole !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      const notification = await storage.createNotification(req.body);
      res.json(notification);
    } catch (error) {
      res.status(500).json({ error: "Failed to create notification" });
    }
  });

  app.patch("/api/admin/notifications/:id/read", async (req, res) => {
    try {
      if (req.session.userRole !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      await storage.markNotificationRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  app.delete("/api/admin/notifications/:id", async (req, res) => {
    try {
      if (req.session.userRole !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      await storage.deleteNotification(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete notification" });
    }
  });

  // ========== REVIEWS ==========
  app.get("/api/restaurants/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviews(req.params.id);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.post("/api/restaurants/:id/reviews", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const review = await storage.createReview({
        userId: req.session.userId,
        restaurantId: req.params.id,
        rating: req.body.rating,
        comment: req.body.comment
      });
      res.json(review);
    } catch (error) {
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  app.delete("/api/reviews/:id", async (req, res) => {
    try {
      if (req.session.userRole !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      await storage.deleteReview(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete review" });
    }
  });

  // ========== SEED DATA ROUTE ==========
  app.post("/api/seed", async (req, res) => {
    try {
      const hashedPassword = await hash("password123", 10);
      
      // Get or create Egyptian Governorates
      const existingGovs = await storage.getGovernorates();
      let cairo = existingGovs.find(g => g.name === "Cairo");
      let giza = existingGovs.find(g => g.name === "Giza");
      let alexandria = existingGovs.find(g => g.name === "Alexandria");
      let redSea = existingGovs.find(g => g.name === "Red Sea");
      let southSinai = existingGovs.find(g => g.name === "South Sinai");
      
      if (!cairo) cairo = await storage.createGovernorate({ name: "Cairo", nameAr: "القاهرة" });
      if (!giza) giza = await storage.createGovernorate({ name: "Giza", nameAr: "الجيزة" });
      if (!alexandria) alexandria = await storage.createGovernorate({ name: "Alexandria", nameAr: "الإسكندرية" });
      if (!redSea) redSea = await storage.createGovernorate({ name: "Red Sea", nameAr: "البحر الأحمر" });
      if (!southSinai) southSinai = await storage.createGovernorate({ name: "South Sinai", nameAr: "جنوب سيناء" });

      // Helper to find or create district
      const existingDistricts = await storage.getDistricts();
      const findOrCreateDistrict = async (govId: string, name: string, nameAr: string) => {
        const existing = existingDistricts.find(d => d.name === name && d.governorateId === govId);
        if (existing) return existing;
        return storage.createDistrict({ governorateId: govId, name, nameAr });
      };

      // Cairo Districts
      const zamalek = await findOrCreateDistrict(cairo.id, "Zamalek", "الزمالك");
      const maadi = await findOrCreateDistrict(cairo.id, "Maadi", "المعادي");
      const heliopolis = await findOrCreateDistrict(cairo.id, "Heliopolis", "مصر الجديدة");
      const newCairo = await findOrCreateDistrict(cairo.id, "New Cairo", "القاهرة الجديدة");
      const gardenCity = await findOrCreateDistrict(cairo.id, "Garden City", "جاردن سيتي");
      const downtown = await findOrCreateDistrict(cairo.id, "Downtown", "وسط البلد");

      // Giza Districts
      const sheikh = await findOrCreateDistrict(giza.id, "Sheikh Zayed", "الشيخ زايد");
      const october = await findOrCreateDistrict(giza.id, "6th of October", "السادس من أكتوبر");
      const dokki = await findOrCreateDistrict(giza.id, "Dokki", "الدقي");
      const mohandessin = await findOrCreateDistrict(giza.id, "Mohandessin", "المهندسين");

      // Alexandria Districts
      const sanStefano = await findOrCreateDistrict(alexandria.id, "San Stefano", "سان ستيفانو");
      const stanley = await findOrCreateDistrict(alexandria.id, "Stanley", "ستانلي");
      const gleem = await findOrCreateDistrict(alexandria.id, "Gleem", "جليم");

      // Red Sea Districts
      const hurghada = await findOrCreateDistrict(redSea.id, "Hurghada", "الغردقة");
      const elGouna = await findOrCreateDistrict(redSea.id, "El Gouna", "الجونة");

      // South Sinai Districts
      const sharmElSheikh = await findOrCreateDistrict(southSinai.id, "Sharm El Sheikh", "شرم الشيخ");

      // Get or create admin user
      let admin = await storage.getUserByEmail("admin@elite.com");
      if (!admin) {
        admin = await storage.createUser({
          email: "admin@elite.com",
          password: hashedPassword,
          name: "مدير النظام",
          role: "admin"
        });
      }

      // Get or create restaurant owner
      let owner = await storage.getUserByEmail("owner@elite.com");
      if (!owner) {
        owner = await storage.createUser({
          email: "owner@elite.com", 
          password: hashedPassword,
          name: "صاحب المطعم",
          role: "restaurant_owner"
        });
      }

      // Get or create customer
      let customer = await storage.getUserByEmail("user@elite.com");
      if (!customer) {
        customer = await storage.createUser({
          email: "user@elite.com",
          password: hashedPassword,
          name: "أحمد محمد",
          role: "customer"
        });
      }

      // Famous Elite Restaurants in Egypt - Cairo
      const sequoia = await storage.createRestaurant({
        ownerId: owner.id,
        name: "Sequoia",
        cuisine: "Mediterranean & Oriental",
        description: "One of Cairo's most iconic restaurants on the Nile with stunning views and exceptional cuisine",
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
        description: "Premium Japanese cuisine featuring fresh sushi, sashimi, and teppanyaki in an elegant setting",
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
        description: "Premium dry-aged steaks and classic American dishes in an elegant, upscale setting",
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
        description: "Authentic Egyptian and Nubian cuisine experience with traditional recipes and warm hospitality",
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
        description: "Exquisite French cuisine in the heart of Cairo with refined flavors and impeccable service",
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
        description: "Authentic Italian pizza and pasta since 1922, a Cairo institution loved by generations",
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
        description: "Fresh premium seafood with Mediterranean flair, featuring the finest catches daily",
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
        description: "Fresh seafood straight from the Mediterranean, grilled to perfection with Egyptian spices",
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
        description: "Pick your fish and we'll cook it your way - fresh catch from the Mediterranean daily",
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
        description: "Premium seafood restaurant on the Red Sea with breathtaking marina views",
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
        description: "Fine Italian dining with spectacular sea views and romantic ambiance",
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
        description: "Luxury hotel restaurant pending approval - world-class dining experience",
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        address: "Kempinski Nile Hotel, Garden City",
        governorateId: cairo.id,
        districtId: gardenCity.id,
        phone: "+20 2 2798 0000",
        priceRange: "$$$$",
        status: "pending"
      });

      // Create menu items for Sequoia
      await storage.createMenuItem({ restaurantId: sequoia.id, name: "Mixed Grills Platter", description: "Premium mixed grill selection with lamb chops, kofta, and chicken served with grilled vegetables", price: "850", category: "Main Courses", image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: sequoia.id, name: "Hummus Beiruti", description: "Traditional Lebanese hummus with tahini, olive oil, and warm pita bread", price: "180", category: "Appetizers", image: "https://images.unsplash.com/photo-1673511294682-23e62cbe45cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: sequoia.id, name: "Grilled Sea Bass", description: "Whole sea bass grilled with Mediterranean herbs, lemon butter, and roasted potatoes", price: "650", category: "Seafood", image: "https://images.unsplash.com/photo-1580959375944-2c89d4c7d9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: sequoia.id, name: "Lamb Shawarma", description: "Tender marinated lamb shawarma with tahini sauce and pickles", price: "480", category: "Main Courses", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: sequoia.id, name: "Fattoush Salad", description: "Fresh Mediterranean salad with crispy pita chips and pomegranate dressing", price: "220", category: "Appetizers", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: sequoia.id, name: "Vine Leaves", description: "Hand-rolled vine leaves stuffed with rice, herbs, and spices", price: "195", category: "Appetizers", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: sequoia.id, name: "Kunafa", description: "Traditional kunafa with cream cheese, pistachios, and rose water syrup", price: "220", category: "Desserts", image: "https://images.unsplash.com/photo-1610440042657-612c34d95e9f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: sequoia.id, name: "Baklava Platter", description: "Assorted homemade baklava with honey and nuts", price: "180", category: "Desserts", image: "https://images.unsplash.com/photo-1519676867240-f03562e64548?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });

      // Create menu items for Kazoku
      await storage.createMenuItem({ restaurantId: kazoku.id, name: "Omakase Sushi", description: "Chef's selection of 12 pieces premium sushi with seasonal fish and uni", price: "1200", category: "Sushi", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: kazoku.id, name: "Wagyu Teppanyaki", description: "A5 Japanese Wagyu beef cooked teppanyaki style with seasonal vegetables", price: "1800", category: "Teppanyaki", image: "https://images.unsplash.com/photo-1544025162-d76978cde07a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: kazoku.id, name: "Dragon Roll", description: "Premium roll with eel, avocado, cucumber, topped with spicy mayo", price: "450", category: "Sushi", image: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: kazoku.id, name: "Sashimi Platter", description: "18 pieces of fresh sashimi including tuna, salmon, yellowtail", price: "850", category: "Sashimi", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: kazoku.id, name: "Tempura Deluxe", description: "Mixed tempura with prawns, vegetables, and dipping sauce", price: "420", category: "Appetizers", image: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: kazoku.id, name: "Miso Black Cod", description: "Grilled black cod marinated in sweet miso glaze", price: "680", category: "Main Courses", image: "https://images.unsplash.com/photo-1625938145312-37a5b1df6e74?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: kazoku.id, name: "Ramen Tonkotsu", description: "Rich pork bone broth ramen with chashu, egg, and bamboo shoots", price: "320", category: "Noodles", image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: kazoku.id, name: "Mochi Ice Cream", description: "Assorted Japanese mochi ice cream - matcha, strawberry, and mango", price: "180", category: "Desserts", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });

      // Create menu items for The Steakhouse
      await storage.createMenuItem({ restaurantId: steakHouse.id, name: "Ribeye Steak 400g", description: "28-day dry-aged USDA Prime ribeye with herb butter and rosemary", price: "1400", category: "Steaks", image: "https://images.unsplash.com/photo-1558030006-450675393462?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: steakHouse.id, name: "Filet Mignon 300g", description: "Tender center-cut filet mignon with black truffle butter and asparagus", price: "1600", category: "Steaks", image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: steakHouse.id, name: "Tomahawk Steak 800g", description: "Impressive bone-in ribeye perfect for sharing, chargrilled to perfection", price: "2400", category: "Steaks", image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: steakHouse.id, name: "Lobster Tail", description: "Grilled lobster tail with drawn butter and lemon", price: "980", category: "Seafood", image: "https://images.unsplash.com/photo-1625938145312-37a5b1df6e74?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: steakHouse.id, name: "Caesar Salad", description: "Classic Caesar with crispy romaine, parmesan, and house-made dressing", price: "220", category: "Starters", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: steakHouse.id, name: "Truffle Mac & Cheese", description: "Creamy mac and cheese with black truffle and breadcrumb crust", price: "280", category: "Sides", image: "https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: steakHouse.id, name: "Chocolate Lava Cake", description: "Warm chocolate cake with molten center and vanilla ice cream", price: "240", category: "Desserts", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });

      // Create menu items for Nubia Lounge
      await storage.createMenuItem({ restaurantId: nubia.id, name: "Fattah", description: "Traditional Egyptian fattah layered with rice, crispy bread, tender meat in rich garlic sauce", price: "380", category: "Main Courses", image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: nubia.id, name: "Molokhia with Rabbit", description: "Classic Egyptian molokhia soup served with tender braised rabbit and vermicelli rice", price: "420", category: "Main Courses", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80", available: true });
      await storage.createMenuItem({ restaurantId: nubia.id, name: "Koshari Royal", description: "Premium koshari with lentils, rice, pasta, topped with spicy tomato sauce and crispy onions", price: "180", category: "Main Courses", image: "https://images.unsplash.com/photo-1623428454614-abaf00244e52?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: nubia.id, name: "Pigeon Mahshi", description: "Stuffed pigeon with freekeh and aromatic spices, roasted to perfection", price: "450", category: "Main Courses", image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: nubia.id, name: "Mezze Platter", description: "Assorted Egyptian mezze with tahini, baba ghanoush, and pickles", price: "240", category: "Appetizers", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: nubia.id, name: "Grilled Kofta", description: "Spiced beef kofta kebabs with grilled vegetables and tahini", price: "320", category: "Grills", image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: nubia.id, name: "Om Ali", description: "Traditional Egyptian bread pudding with milk, nuts, raisins and cream", price: "150", category: "Desserts", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });

      // Create menu items for La Capitale
      await storage.createMenuItem({ restaurantId: laCapitale.id, name: "Beef Bourguignon", description: "Classic French beef stew braised in red wine with pearl onions and mushrooms", price: "680", category: "Main Courses", image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: laCapitale.id, name: "Duck Confit", description: "Slow-cooked duck leg with orange glaze, roasted potatoes and green beans", price: "750", category: "Main Courses", image: "https://images.unsplash.com/photo-1544025162-d76978cde07a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: laCapitale.id, name: "Coq au Vin", description: "Chicken braised in Burgundy wine with bacon, mushrooms and pearl onions", price: "620", category: "Main Courses", image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: laCapitale.id, name: "French Onion Soup", description: "Caramelized onions in rich beef broth topped with gruyere cheese crouton", price: "220", category: "Starters", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80", available: true });
      await storage.createMenuItem({ restaurantId: laCapitale.id, name: "Escargots de Bourgogne", description: "Six Burgundy snails in garlic herb butter served in shells", price: "380", category: "Starters", image: "https://images.unsplash.com/photo-1625938145312-37a5b1df6e74?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: laCapitale.id, name: "Tarte Tatin", description: "Upside-down caramelized apple tart with vanilla ice cream", price: "240", category: "Desserts", image: "https://images.unsplash.com/photo-1587132117816-045b474be826?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: laCapitale.id, name: "Creme Brulee", description: "Classic vanilla creme brulee with caramelized sugar crust", price: "180", category: "Desserts", image: "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });

      // Create menu items for Maison Thomas
      await storage.createMenuItem({ restaurantId: maison.id, name: "Margherita Pizza", description: "Classic Neapolitan pizza with San Marzano tomatoes, fresh mozzarella and basil", price: "280", category: "Pizza", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80", available: true });
      await storage.createMenuItem({ restaurantId: maison.id, name: "Quattro Formaggi", description: "Four cheese pizza with mozzarella, gorgonzola, parmesan and fontina", price: "350", category: "Pizza", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: maison.id, name: "Diavola Pizza", description: "Spicy pizza with pepperoni, chili peppers, mozzarella and tomato sauce", price: "320", category: "Pizza", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1480&q=80", available: true });
      await storage.createMenuItem({ restaurantId: maison.id, name: "Spaghetti Carbonara", description: "Authentic carbonara with guanciale, egg yolk, pecorino romano and black pepper", price: "320", category: "Pasta", image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80", available: true });
      await storage.createMenuItem({ restaurantId: maison.id, name: "Penne Arrabiata", description: "Spicy tomato sauce with garlic, chili peppers and fresh basil", price: "280", category: "Pasta", image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: maison.id, name: "Lasagna Bolognese", description: "Traditional lasagna with slow-cooked Bolognese sauce and bechamel", price: "380", category: "Pasta", image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: maison.id, name: "Tiramisu", description: "Classic Italian tiramisu with espresso-soaked ladyfingers and mascarpone", price: "160", category: "Desserts", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });

      // Create menu items for Pier 88
      await storage.createMenuItem({ restaurantId: pier88.id, name: "Grilled Lobster", description: "Fresh whole lobster grilled with garlic herb butter and lemon", price: "1200", category: "Seafood", image: "https://images.unsplash.com/photo-1625938145312-37a5b1df6e74?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: pier88.id, name: "Chilean Sea Bass", description: "Pan-seared Chilean sea bass with miso glaze and baby bok choy", price: "850", category: "Fish", image: "https://images.unsplash.com/photo-1580959375944-48062d9e3f59?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: pier88.id, name: "Seafood Platter Royal", description: "Mixed grilled seafood platter for two with lobster, prawns, calamari and fish", price: "950", category: "Platters", image: "https://images.unsplash.com/photo-1559737558-2f5a555d4ae3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: pier88.id, name: "Grilled Tiger Prawns", description: "Jumbo tiger prawns with garlic butter, herbs and lemon", price: "720", category: "Shellfish", image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: pier88.id, name: "Shrimp Scampi", description: "Jumbo shrimp in white wine garlic butter sauce over linguine", price: "580", category: "Pasta", image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: pier88.id, name: "Seafood Risotto", description: "Creamy saffron risotto with mixed seafood and parmesan", price: "520", category: "Pasta & Rice", image: "https://images.unsplash.com/photo-1476124369491-f5aac27c0647?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: pier88.id, name: "Seafood Chowder", description: "Creamy New England style seafood chowder in bread bowl", price: "280", category: "Starters", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80", available: true });

      // Create menu items for Balbaa Village
      await storage.createMenuItem({ restaurantId: balbaa.id, name: "Sayadia", description: "Traditional Egyptian fish rice with caramelized onions, pine nuts and aromatic spices", price: "380", category: "Main Courses", image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: balbaa.id, name: "Mixed Seafood Grill", description: "Fresh catch grilled with Egyptian spices, lemon and herbs", price: "750", category: "Seafood", image: "https://images.unsplash.com/photo-1559737558-2f5a555d4ae3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: balbaa.id, name: "Grilled Sea Bream", description: "Whole grilled bream with chermoula and Mediterranean salad", price: "580", category: "Fish", image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: balbaa.id, name: "Grilled Calamari", description: "Tender grilled calamari rings with garlic tahini sauce and lemon", price: "320", category: "Appetizers", image: "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: balbaa.id, name: "Fish Tajine", description: "Clay pot-baked fish with tomatoes, bell peppers and Mediterranean herbs", price: "450", category: "Main Courses", image: "https://images.unsplash.com/photo-1580959375944-48062d9e3f59?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: balbaa.id, name: "Seafood Pasta", description: "Fresh pasta with mixed seafood in tomato saffron sauce", price: "420", category: "Pasta", image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: balbaa.id, name: "Fried Shrimp", description: "Crispy fried shrimp with tartar sauce and fries", price: "350", category: "Seafood", image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });

      // Create menu items for Fish Market
      await storage.createMenuItem({ restaurantId: fishMarket.id, name: "Fried Fish Alexandria Style", description: "Crispy fried fish with cumin and garlic served with tahini rice and salad", price: "350", category: "Fish", image: "https://images.unsplash.com/photo-1580959375944-48062d9e3f59?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: fishMarket.id, name: "Grilled Sultan Ibrahim", description: "Red mullet grilled with Mediterranean herbs and olive oil", price: "580", category: "Fish", image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: fishMarket.id, name: "Alexandrian Shrimp", description: "Jumbo Alexandria prawns grilled with garlic butter and lemon", price: "550", category: "Seafood", image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: fishMarket.id, name: "Mixed Seafood Grill", description: "Grilled selection of fish, calamari, prawns and crab with garlic sauce", price: "720", category: "Platters", image: "https://images.unsplash.com/photo-1559737558-2f5a555d4ae3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: fishMarket.id, name: "Crab with Bechamel", description: "Fresh crab meat baked with creamy bechamel sauce", price: "480", category: "Seafood", image: "https://images.unsplash.com/photo-1625938145312-37a5b1df6e74?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: fishMarket.id, name: "Seafood Rice", description: "Egyptian-style rice cooked with mixed seafood and aromatic spices", price: "320", category: "Main Courses", image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: fishMarket.id, name: "Fried Calamari", description: "Crispy golden calamari rings with tartar sauce", price: "280", category: "Appetizers", image: "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });

      // Create menu items for Moby Dick
      await storage.createMenuItem({ restaurantId: moby.id, name: "Grilled Red Sea Shrimp", description: "Jumbo Red Sea shrimp grilled with garlic, herbs and lemon butter", price: "520", category: "Seafood", image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: moby.id, name: "Grouper Fillet", description: "Pan-seared grouper fillet with lemon butter sauce and seasonal vegetables", price: "580", category: "Fish", image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: moby.id, name: "Grilled Hamour", description: "Whole grilled hamour fish with Mediterranean spices and herbs", price: "680", category: "Fish", image: "https://images.unsplash.com/photo-1580959375944-48062d9e3f59?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: moby.id, name: "Seafood Paella", description: "Spanish rice with mixed Red Sea seafood and saffron", price: "620", category: "Main Courses", image: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: moby.id, name: "Lobster Tail Grilled", description: "Fresh Red Sea lobster tail grilled with herb butter", price: "950", category: "Seafood", image: "https://images.unsplash.com/photo-1625938145312-37a5b1df6e74?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: moby.id, name: "Tuna Tartare", description: "Fresh Red Sea tuna with Asian seasonings and sesame", price: "380", category: "Starters", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80", available: true });
      await storage.createMenuItem({ restaurantId: moby.id, name: "Key Lime Pie", description: "Refreshing key lime pie with whipped cream and graham crust", price: "160", category: "Desserts", image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1364&q=80", available: true });

      // Create menu items for La Luna
      await storage.createMenuItem({ restaurantId: la.id, name: "Ossobuco alla Milanese", description: "Slow-braised veal shanks with saffron risotto and gremolata", price: "780", category: "Main Courses", image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: la.id, name: "Risotto ai Frutti di Mare", description: "Creamy seafood risotto with fresh Red Sea catches and white wine", price: "620", category: "Main Courses", image: "https://images.unsplash.com/photo-1476124369491-f5aac27c0647?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: la.id, name: "Linguine alle Vongole", description: "Fresh clams in white wine garlic sauce with Italian parsley", price: "520", category: "Pasta", image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: la.id, name: "Branzino al Forno", description: "Oven-roasted sea bass with cherry tomatoes and herbs", price: "680", category: "Fish", image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: la.id, name: "Burrata Caprese", description: "Creamy burrata with heirloom tomatoes, basil and aged balsamic", price: "280", category: "Starters", image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: la.id, name: "Carpaccio di Manzo", description: "Thin-sliced beef carpaccio with arugula, parmesan and truffle oil", price: "340", category: "Starters", image: "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });
      await storage.createMenuItem({ restaurantId: la.id, name: "Panna Cotta", description: "Vanilla panna cotta with fresh berry compote and mint", price: "180", category: "Desserts", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", available: true });

      // Create sample reservations
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      
      // Sequoia reservations
      await storage.createReservation({ userId: customer.id, restaurantId: sequoia.id, date: tomorrow, time: "19:00", partySize: 4, status: "confirmed", specialRequests: "Window table preferred" });
      await storage.createReservation({ userId: customer.id, restaurantId: sequoia.id, date: tomorrow, time: "20:30", partySize: 2, status: "pending" });
      
      // Kazoku reservations
      await storage.createReservation({ userId: customer.id, restaurantId: kazoku.id, date: today, time: "19:30", partySize: 3, status: "completed" });
      await storage.createReservation({ userId: customer.id, restaurantId: kazoku.id, date: tomorrow, time: "20:00", partySize: 6, status: "confirmed" });
      
      // The Steakhouse reservations
      await storage.createReservation({ userId: customer.id, restaurantId: steakHouse.id, date: tomorrow, time: "19:00", partySize: 4, status: "confirmed", specialRequests: "Celebration dinner" });
      
      // La Capitale reservations
      await storage.createReservation({ userId: customer.id, restaurantId: laCapitale.id, date: today, time: "20:00", partySize: 2, status: "completed" });
      
      // Nubia Lounge reservations
      await storage.createReservation({ userId: customer.id, restaurantId: nubia.id, date: tomorrow, time: "18:30", partySize: 5, status: "confirmed" });
      
      // Maison Thomas reservations
      await storage.createReservation({ userId: customer.id, restaurantId: maison.id, date: tomorrow, time: "19:00", partySize: 2, status: "pending" });
      
      // Pier 88 reservations
      await storage.createReservation({ userId: customer.id, restaurantId: pier88.id, date: tomorrow, time: "20:00", partySize: 4, status: "confirmed", specialRequests: "Birthday party" });
      
      // Balbaa Village reservations
      await storage.createReservation({ userId: customer.id, restaurantId: balbaa.id, date: today, time: "19:00", partySize: 3, status: "completed" });
      
      // Fish Market reservations
      await storage.createReservation({ userId: customer.id, restaurantId: fishMarket.id, date: tomorrow, time: "18:00", partySize: 2, status: "confirmed" });
      
      // Moby Dick reservations
      await storage.createReservation({ userId: customer.id, restaurantId: moby.id, date: tomorrow, time: "19:00", partySize: 4, status: "pending" });
      
      // La Luna reservations
      await storage.createReservation({ userId: customer.id, restaurantId: la.id, date: today, time: "20:30", partySize: 2, status: "completed" });
      await storage.createReservation({ userId: customer.id, restaurantId: la.id, date: tomorrow, time: "19:30", partySize: 6, status: "confirmed", specialRequests: "Romantic dinner" });

      // Create sample orders with order items
      const seqMenuItems = await storage.getMenuItems(sequoia.id);
      const kazMenuItems = await storage.getMenuItems(kazoku.id);
      const stMenuItems = await storage.getMenuItems(steakHouse.id);
      const maisonMenuItems = await storage.getMenuItems(maison.id);

      // Sequoia order
      const order1 = await storage.createOrder({ userId: customer.id, restaurantId: sequoia.id, status: "served", total: "2100", customerName: "Ahmed Al-Mansouri" });
      if (seqMenuItems.length > 0) {
        await storage.createOrderItem({ orderId: order1.id, menuItemId: seqMenuItems[0].id, quantity: 2, price: seqMenuItems[0].price });
        if (seqMenuItems.length > 1) {
          await storage.createOrderItem({ orderId: order1.id, menuItemId: seqMenuItems[1].id, quantity: 1, price: seqMenuItems[1].price });
        }
      }

      // Kazoku order
      const order2 = await storage.createOrder({ userId: customer.id, restaurantId: kazoku.id, status: "ready", total: "2850", customerName: "Fatima Hassan" });
      if (kazMenuItems.length > 0) {
        await storage.createOrderItem({ orderId: order2.id, menuItemId: kazMenuItems[0].id, quantity: 1, price: kazMenuItems[0].price });
        if (kazMenuItems.length > 1) {
          await storage.createOrderItem({ orderId: order2.id, menuItemId: kazMenuItems[1].id, quantity: 1, price: kazMenuItems[1].price });
        }
      }

      // The Steakhouse order
      const order3 = await storage.createOrder({ userId: customer.id, restaurantId: steakHouse.id, status: "preparing", total: "3500", customerName: "Mohamed Karim" });
      if (stMenuItems.length > 0) {
        await storage.createOrderItem({ orderId: order3.id, menuItemId: stMenuItems[0].id, quantity: 2, price: stMenuItems[0].price });
        if (stMenuItems.length > 1) {
          await storage.createOrderItem({ orderId: order3.id, menuItemId: stMenuItems[1].id, quantity: 1, price: stMenuItems[1].price });
        }
      }

      // Maison Thomas order
      const order4 = await storage.createOrder({ userId: customer.id, restaurantId: maison.id, status: "pending", total: "630", customerName: "Sara Ahmad" });
      if (maisonMenuItems.length > 0) {
        await storage.createOrderItem({ orderId: order4.id, menuItemId: maisonMenuItems[0].id, quantity: 2, price: maisonMenuItems[0].price });
        if (maisonMenuItems.length > 1) {
          await storage.createOrderItem({ orderId: order4.id, menuItemId: maisonMenuItems[1].id, quantity: 1, price: maisonMenuItems[1].price });
        }
      }

      // Create favorites
      await storage.addFavorite({ userId: customer.id, restaurantId: sequoia.id });
      await storage.addFavorite({ userId: customer.id, restaurantId: kazoku.id });
      await storage.addFavorite({ userId: customer.id, restaurantId: steakHouse.id });
      await storage.addFavorite({ userId: customer.id, restaurantId: laCapitale.id });
      await storage.addFavorite({ userId: customer.id, restaurantId: pier88.id });
      await storage.addFavorite({ userId: customer.id, restaurantId: la.id });

      res.json({ success: true, message: "Egyptian seed data created successfully with all mock data" });
    } catch (error) {
      console.error("Seed error:", error);
      res.status(500).json({ error: "Failed to seed data" });
    }
  });

  return httpServer;
}
