import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";
import type { Restaurant, MenuItem, Reservation, Order, Governorate, District } from "@shared/schema";

// ========== LOCATION HOOKS ==========

export function useGovernorates() {
  return useQuery<Governorate[]>({
    queryKey: ["/api/governorates"],
    queryFn: async () => {
      const res = await fetch("/api/governorates");
      if (!res.ok) throw new Error("Failed to fetch governorates");
      return res.json();
    },
  });
}

export function useDistricts(governorateId?: string) {
  return useQuery<District[]>({
    queryKey: ["/api/districts", governorateId],
    queryFn: async () => {
      const params = governorateId ? `?governorateId=${governorateId}` : "";
      const res = await fetch(`/api/districts${params}`);
      if (!res.ok) throw new Error("Failed to fetch districts");
      return res.json();
    },
    enabled: !!governorateId,
  });
}

// ========== RESTAURANT HOOKS ==========

export function useRestaurants(governorateId?: string, districtId?: string) {
  const params = new URLSearchParams();
  if (governorateId) params.append("governorateId", governorateId);
  if (districtId) params.append("districtId", districtId);
  const queryString = params.toString();
  
  return useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants", governorateId || "all", districtId || "all"],
    queryFn: async () => {
      const url = queryString ? `/api/restaurants?${queryString}` : "/api/restaurants";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch restaurants");
      return res.json();
    },
  });
}

export function useRestaurant(id: string) {
  return useQuery<Restaurant>({
    queryKey: ["/api/restaurants", id],
    queryFn: async () => {
      const res = await fetch(`/api/restaurants/${id}`);
      if (!res.ok) throw new Error("Failed to fetch restaurant");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useMenu(restaurantId: string) {
  return useQuery<MenuItem[]>({
    queryKey: ["/api/restaurants", restaurantId, "menu"],
    queryFn: async () => {
      const res = await fetch(`/api/restaurants/${restaurantId}/menu`);
      if (!res.ok) throw new Error("Failed to fetch menu");
      return res.json();
    },
    enabled: !!restaurantId,
  });
}

export function useReservations(userId?: string, restaurantId?: string) {
  const params = new URLSearchParams();
  if (userId) params.append("userId", userId);
  if (restaurantId) params.append("restaurantId", restaurantId);
  
  return useQuery<Reservation[]>({
    queryKey: ["/api/reservations", params.toString()],
    queryFn: async () => {
      const res = await fetch(`/api/reservations?${params}`);
      if (!res.ok) throw new Error("Failed to fetch reservations");
      return res.json();
    },
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      userId: string;
      restaurantId: string;
      date: string;
      time: string;
      partySize: number;
      specialRequests?: string;
    }) => {
      const res = await apiRequest("POST", "/api/reservations", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
    },
  });
}

export function useOrders(restaurantId?: string) {
  const params = restaurantId ? `?restaurantId=${restaurantId}` : "";
  
  return useQuery<Order[]>({
    queryKey: ["/api/orders", restaurantId || "all"],
    queryFn: async () => {
      const res = await fetch(`/api/orders${params}`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
    enabled: !!restaurantId,
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/orders/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
  });
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      restaurantId: string;
      name: string;
      description?: string;
      price: string;
      category: string;
      image?: string;
    }) => {
      const res = await apiRequest("POST", "/api/menu-items", data);
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", variables.restaurantId, "menu"] });
    },
  });
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const res = await apiRequest("PATCH", `/api/menu-items/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
    },
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/menu-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
    },
  });
}

export function useAdminStats() {
  return useQuery<{
    restaurants: number;
    users: number;
    orders: number;
    reservations: number;
    pendingApprovals: number;
    pendingReservations: number;
  }>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });
}

export function useAdminRestaurants() {
  return useQuery<Restaurant[]>({
    queryKey: ["/api/admin/restaurants"],
    queryFn: async () => {
      const res = await fetch("/api/admin/restaurants", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch restaurants");
      return res.json();
    },
  });
}

export function useApproveRestaurant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "active" | "suspended" }) => {
      const res = await apiRequest("PATCH", `/api/restaurants/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
  });
}

export function useCreateRestaurant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      name: string;
      cuisine: string;
      description?: string;
      image?: string;
      address: string;
      phone?: string;
      priceRange?: string;
    }) => {
      const res = await apiRequest("POST", "/api/restaurants", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
    },
  });
}

export function useFavorites() {
  return useQuery<{ restaurantId: string }[]>({
    queryKey: ["/api/favorites"],
    queryFn: async () => {
      const res = await fetch("/api/favorites", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ restaurantId, isFavorite }: { restaurantId: string; isFavorite: boolean }) => {
      if (isFavorite) {
        await apiRequest("DELETE", `/api/favorites/${restaurantId}`);
      } else {
        await apiRequest("POST", "/api/favorites", { restaurantId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
  });
}

// ========== ADMIN HOOKS ==========

export function useAdminUsers() {
  return useQuery<{
    id: string;
    email: string;
    name: string;
    phone: string | null;
    avatar: string | null;
    role: string;
    createdAt: string;
  }[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; role?: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
  });
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
  });
}

export function useAdminReservations() {
  return useQuery<Reservation[]>({
    queryKey: ["/api/admin/reservations"],
    queryFn: async () => {
      const res = await fetch("/api/admin/reservations", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch reservations");
      return res.json();
    },
  });
}

export function useUpdateAdminReservation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/reservations/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reservations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
  });
}

export function useAdminOrders() {
  return useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
    queryFn: async () => {
      const res = await fetch("/api/admin/orders", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
  });
}

export function useUpdateAdminOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/orders/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
  });
}
