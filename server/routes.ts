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

  // ========== RESTAURANT ROUTES ==========
  app.get("/api/restaurants", async (req, res) => {
    try {
      const restaurants = await storage.getRestaurants();
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
      
      // Create admin user
      const admin = await storage.createUser({
        email: "admin@elite.com",
        password: hashedPassword,
        name: "Admin User",
        role: "admin"
      });

      // Create restaurant owner
      const owner = await storage.createUser({
        email: "owner@elite.com", 
        password: hashedPassword,
        name: "Restaurant Owner",
        role: "restaurant_owner"
      });

      // Create customer
      const customer = await storage.createUser({
        email: "user@elite.com",
        password: hashedPassword,
        name: "Jordan Davis",
        role: "customer"
      });

      // Create restaurants
      const lumiere = await storage.createRestaurant({
        ownerId: owner.id,
        name: "Lumière",
        cuisine: "French Fine Dining",
        description: "An intimate French dining experience with exquisite tasting menus",
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        address: "123 Downtown Avenue, Metropolis",
        phone: "+1 (555) 123-4567",
        priceRange: "$$$$",
        status: "active"
      });

      const sakura = await storage.createRestaurant({
        ownerId: owner.id,
        name: "Sakura Zen",
        cuisine: "Modern Japanese",
        description: "Contemporary Japanese cuisine with traditional roots",
        image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
        address: "456 Arts District, Metropolis",
        phone: "+1 (555) 234-5678",
        priceRange: "$$$",
        status: "active"
      });

      const obsidian = await storage.createRestaurant({
        ownerId: owner.id,
        name: "The Obsidian Steakhouse",
        cuisine: "Steakhouse",
        description: "Premium cuts in an elegant dark atmosphere",
        image: "https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        address: "789 Financial District, Metropolis",
        phone: "+1 (555) 345-6789",
        priceRange: "$$$$",
        status: "pending"
      });

      // Create menu items for Lumière
      await storage.createMenuItem({
        restaurantId: lumiere.id,
        name: "Truffle Risotto",
        description: "Arborio rice with black truffle and aged parmesan",
        price: "45",
        category: "Mains",
        image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        available: true
      });

      await storage.createMenuItem({
        restaurantId: lumiere.id,
        name: "Wagyu Beef Tartare",
        description: "Hand-cut A5 wagyu with quail egg and capers",
        price: "38",
        category: "Starters",
        image: "https://images.unsplash.com/photo-1519708227418-c8fd9a3a27cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        available: true
      });

      await storage.createMenuItem({
        restaurantId: lumiere.id,
        name: "Gold Leaf Chocolate Dome",
        description: "Valrhona chocolate with raspberry coulis",
        price: "32",
        category: "Desserts",
        image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1364&q=80",
        available: true
      });

      res.json({ success: true, message: "Seed data created successfully" });
    } catch (error) {
      console.error("Seed error:", error);
      res.status(500).json({ error: "Failed to seed data" });
    }
  });

  return httpServer;
}
