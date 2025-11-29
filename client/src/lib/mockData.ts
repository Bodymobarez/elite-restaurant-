import { User, Coffee, TrendingUp, Users, Settings, Menu, Calendar } from "lucide-react";

// Mock Data for Elite Hub

export const currentUser = {
  id: "1",
  name: "Admin User",
  role: "admin", // 'admin' | 'restaurant_owner' | 'customer'
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
};

export const restaurants = [
  {
    id: "1",
    name: "Lumière",
    cuisine: "French Fine Dining",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    location: "Downtown, Metropolis",
    priceRange: "$$$$",
    status: "active",
    ordersToday: 24,
    revenueToday: 4250
  },
  {
    id: "2",
    name: "Sakura Zen",
    cuisine: "Modern Japanese",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
    location: "Arts District",
    priceRange: "$$$",
    status: "active",
    ordersToday: 18,
    revenueToday: 2800
  },
  {
    id: "3",
    name: "The Obsidian Steakhouse",
    cuisine: "Steakhouse",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    location: "Financial District",
    priceRange: "$$$$",
    status: "pending",
    ordersToday: 0,
    revenueToday: 0
  }
];

export const menuItems = [
  {
    id: "101",
    restaurantId: "1",
    name: "Truffle Risotto",
    price: 45,
    category: "Mains",
    image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    available: true
  },
  {
    id: "102",
    restaurantId: "1",
    name: "Wagyu Beef Tartare",
    price: 38,
    category: "Starters",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a3a27cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    available: true
  },
  {
    id: "103",
    restaurantId: "1",
    name: "Gold Leaf Chocolate Dome",
    price: 32,
    category: "Desserts",
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1364&q=80",
    available: true
  }
];

export const recentOrders = [
  {
    id: "ORD-7721",
    customer: "Alice Freeman",
    items: ["Truffle Risotto", "Vintage Red Wine"],
    total: 185.00,
    status: "Preparing",
    time: "10 mins ago"
  },
  {
    id: "ORD-7720",
    customer: "Michael Chen",
    items: ["Wagyu Beef Tartare", "Lobster Bisque"],
    total: 112.50,
    status: "Ready",
    time: "25 mins ago"
  },
  {
    id: "ORD-7719",
    customer: "Sarah Jones",
    items: ["Chef's Tasting Menu x2"],
    total: 450.00,
    status: "Served",
    time: "1 hour ago"
  }
];

export const adminStats = [
  { label: "Total Revenue", value: "$124,500", change: "+12%", icon: TrendingUp },
  { label: "Active Restaurants", value: "48", change: "+3", icon: Coffee },
  { label: "Total Users", value: "12.5k", change: "+8.2%", icon: Users },
  { label: "Pending Approvals", value: "5", change: "-2", icon: Settings },
];
