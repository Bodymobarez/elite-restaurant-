import { 
  users, restaurants, menuItems, reservations, orders, orderItems, favorites,
  governorates, districts, reviews, activityLogs, notifications,
  type User, type InsertUser,
  type Restaurant, type InsertRestaurant,
  type MenuItem, type InsertMenuItem,
  type Reservation, type InsertReservation,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type Favorite, type InsertFavorite,
  type Governorate, type InsertGovernorate,
  type District, type InsertDistrict,
  type Review, type InsertReview,
  type ActivityLog, type InsertActivityLog,
  type Notification, type InsertNotification
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Governorates & Districts
  getGovernorates(): Promise<Governorate[]>;
  getGovernorate(id: string): Promise<Governorate | undefined>;
  createGovernorate(gov: InsertGovernorate): Promise<Governorate>;
  getDistricts(governorateId?: string): Promise<District[]>;
  getDistrict(id: string): Promise<District | undefined>;
  createDistrict(district: InsertDistrict): Promise<District>;

  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  // Restaurants
  getRestaurants(governorateId?: string, districtId?: string): Promise<Restaurant[]>;
  getRestaurant(id: string): Promise<Restaurant | undefined>;
  getRestaurantsByOwner(ownerId: string): Promise<Restaurant[]>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  updateRestaurant(id: string, data: Partial<InsertRestaurant>): Promise<Restaurant | undefined>;
  deleteRestaurant(id: string): Promise<boolean>;

  // Menu Items
  getMenuItems(restaurantId: string): Promise<MenuItem[]>;
  getMenuItem(id: string): Promise<MenuItem | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: string, data: Partial<InsertMenuItem>): Promise<MenuItem | undefined>;
  deleteMenuItem(id: string): Promise<boolean>;

  // Reservations
  getReservations(userId?: string, restaurantId?: string): Promise<Reservation[]>;
  getReservation(id: string): Promise<Reservation | undefined>;
  createReservation(reservation: InsertReservation): Promise<Reservation>;
  updateReservation(id: string, data: Partial<InsertReservation>): Promise<Reservation | undefined>;

  // Orders
  getOrders(restaurantId?: string): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, data: Partial<InsertOrder>): Promise<Order | undefined>;

  // Order Items
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;

  // Favorites
  getFavorites(userId: string): Promise<Favorite[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: string, restaurantId: string): Promise<boolean>;
  isFavorite(userId: string, restaurantId: string): Promise<boolean>;

  // Reviews
  getReviews(restaurantId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  deleteReview(id: string): Promise<boolean>;

  // Activity Logs
  getActivityLogs(limit?: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;

  // Notifications
  getNotifications(userId?: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<boolean>;
  deleteNotification(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Governorates & Districts
  async getGovernorates(): Promise<Governorate[]> {
    return db.select().from(governorates).orderBy(governorates.name);
  }

  async getGovernorate(id: string): Promise<Governorate | undefined> {
    const [gov] = await db.select().from(governorates).where(eq(governorates.id, id));
    return gov || undefined;
  }

  async createGovernorate(gov: InsertGovernorate): Promise<Governorate> {
    const [created] = await db.insert(governorates).values(gov).returning();
    return created;
  }

  async getDistricts(governorateId?: string): Promise<District[]> {
    if (governorateId) {
      return db.select().from(districts).where(eq(districts.governorateId, governorateId)).orderBy(districts.name);
    }
    return db.select().from(districts).orderBy(districts.name);
  }

  async getDistrict(id: string): Promise<District | undefined> {
    const [district] = await db.select().from(districts).where(eq(districts.id, id));
    return district || undefined;
  }

  async createDistrict(district: InsertDistrict): Promise<District> {
    const [created] = await db.insert(districts).values(district).returning();
    return created;
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async deleteUser(id: string): Promise<boolean> {
    await db.delete(users).where(eq(users.id, id));
    return true;
  }

  // Restaurants
  async getRestaurants(governorateId?: string, districtId?: string): Promise<Restaurant[]> {
    if (districtId) {
      return db.select().from(restaurants)
        .where(and(eq(restaurants.status, "active"), eq(restaurants.districtId, districtId)))
        .orderBy(desc(restaurants.rating));
    }
    if (governorateId) {
      return db.select().from(restaurants)
        .where(and(eq(restaurants.status, "active"), eq(restaurants.governorateId, governorateId)))
        .orderBy(desc(restaurants.rating));
    }
    return db.select().from(restaurants).where(eq(restaurants.status, "active")).orderBy(desc(restaurants.rating));
  }

  async getRestaurant(id: string): Promise<Restaurant | undefined> {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, id));
    return restaurant || undefined;
  }

  async getRestaurantsByOwner(ownerId: string): Promise<Restaurant[]> {
    return db.select().from(restaurants).where(eq(restaurants.ownerId, ownerId));
  }

  async createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant> {
    const [created] = await db.insert(restaurants).values(restaurant).returning();
    return created;
  }

  async updateRestaurant(id: string, data: Partial<InsertRestaurant>): Promise<Restaurant | undefined> {
    const [updated] = await db.update(restaurants).set(data).where(eq(restaurants.id, id)).returning();
    return updated || undefined;
  }

  async deleteRestaurant(id: string): Promise<boolean> {
    const result = await db.delete(restaurants).where(eq(restaurants.id, id));
    return true;
  }

  // Menu Items
  async getMenuItems(restaurantId: string): Promise<MenuItem[]> {
    return db.select().from(menuItems).where(eq(menuItems.restaurantId, restaurantId));
  }

  async getMenuItem(id: string): Promise<MenuItem | undefined> {
    const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return item || undefined;
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const [created] = await db.insert(menuItems).values(item).returning();
    return created;
  }

  async updateMenuItem(id: string, data: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    const [updated] = await db.update(menuItems).set(data).where(eq(menuItems.id, id)).returning();
    return updated || undefined;
  }

  async deleteMenuItem(id: string): Promise<boolean> {
    await db.delete(menuItems).where(eq(menuItems.id, id));
    return true;
  }

  // Reservations
  async getReservations(userId?: string, restaurantId?: string): Promise<Reservation[]> {
    if (userId) {
      return db.select().from(reservations).where(eq(reservations.userId, userId)).orderBy(desc(reservations.createdAt));
    }
    if (restaurantId) {
      return db.select().from(reservations).where(eq(reservations.restaurantId, restaurantId)).orderBy(desc(reservations.createdAt));
    }
    return db.select().from(reservations).orderBy(desc(reservations.createdAt));
  }

  async getReservation(id: string): Promise<Reservation | undefined> {
    const [reservation] = await db.select().from(reservations).where(eq(reservations.id, id));
    return reservation || undefined;
  }

  async createReservation(reservation: InsertReservation): Promise<Reservation> {
    const confirmationCode = "ELITE" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const [created] = await db.insert(reservations).values({ ...reservation, confirmationCode }).returning();
    return created;
  }

  async updateReservation(id: string, data: Partial<InsertReservation>): Promise<Reservation | undefined> {
    const [updated] = await db.update(reservations).set(data).where(eq(reservations.id, id)).returning();
    return updated || undefined;
  }

  // Orders
  async getOrders(restaurantId?: string): Promise<Order[]> {
    if (restaurantId) {
      return db.select().from(orders).where(eq(orders.restaurantId, restaurantId)).orderBy(desc(orders.createdAt));
    }
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [created] = await db.insert(orders).values(order).returning();
    return created;
  }

  async updateOrder(id: string, data: Partial<InsertOrder>): Promise<Order | undefined> {
    const [updated] = await db.update(orders).set(data).where(eq(orders.id, id)).returning();
    return updated || undefined;
  }

  // Order Items
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [created] = await db.insert(orderItems).values(item).returning();
    return created;
  }

  // Favorites
  async getFavorites(userId: string): Promise<Favorite[]> {
    return db.select().from(favorites).where(eq(favorites.userId, userId));
  }

  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [created] = await db.insert(favorites).values(favorite).returning();
    return created;
  }

  async removeFavorite(userId: string, restaurantId: string): Promise<boolean> {
    await db.delete(favorites).where(
      and(eq(favorites.userId, userId), eq(favorites.restaurantId, restaurantId))
    );
    return true;
  }

  async isFavorite(userId: string, restaurantId: string): Promise<boolean> {
    const [fav] = await db.select().from(favorites).where(
      and(eq(favorites.userId, userId), eq(favorites.restaurantId, restaurantId))
    );
    return !!fav;
  }

  // Reviews
  async getReviews(restaurantId: string): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.restaurantId, restaurantId)).orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [created] = await db.insert(reviews).values(review).returning();
    return created;
  }

  async deleteReview(id: string): Promise<boolean> {
    await db.delete(reviews).where(eq(reviews.id, id));
    return true;
  }

  // Activity Logs
  async getActivityLogs(limit?: number): Promise<ActivityLog[]> {
    const query = db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt));
    if (limit) {
      return query.limit(limit);
    }
    return query;
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [created] = await db.insert(activityLogs).values(log).returning();
    return created;
  }

  // Notifications
  async getNotifications(userId?: string): Promise<Notification[]> {
    if (userId) {
      return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
    }
    return db.select().from(notifications).orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [created] = await db.insert(notifications).values(notification).returning();
    return created;
  }

  async markNotificationRead(id: string): Promise<boolean> {
    await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
    return true;
  }

  async deleteNotification(id: string): Promise<boolean> {
    await db.delete(notifications).where(eq(notifications.id, id));
    return true;
  }
}

export const storage = new DatabaseStorage();
