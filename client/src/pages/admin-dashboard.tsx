import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  useAdminStats, useAdminRestaurants, useApproveRestaurant,
  useAdminUsers, useUpdateAdminUser, useDeleteAdminUser,
  useAdminReservations, useUpdateAdminReservation,
  useAdminOrders, useUpdateAdminOrder, useRestaurants
} from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Check, X, MoreHorizontal, TrendingUp, Coffee, Users, Settings, Loader2, 
  Calendar, ShoppingBag, UserCog, Store, ClipboardList, BarChart3, Trash2, Shield
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: restaurants, isLoading: restaurantsLoading } = useAdminRestaurants();
  const { data: allRestaurants } = useRestaurants();
  const { data: users, isLoading: usersLoading } = useAdminUsers();
  const { data: reservations, isLoading: reservationsLoading } = useAdminReservations();
  const { data: orders, isLoading: ordersLoading } = useAdminOrders();
  
  const approveRestaurant = useApproveRestaurant();
  const updateUser = useUpdateAdminUser();
  const deleteUser = useDeleteAdminUser();
  const updateReservation = useUpdateAdminReservation();
  const updateOrder = useUpdateAdminOrder();

  const handleApprove = async (id: string, name: string) => {
    try {
      await approveRestaurant.mutateAsync({ id, status: "active" });
      toast({ title: "Restaurant Approved", description: `${name} is now live.` });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to approve restaurant" });
    }
  };

  const handleReject = async (id: string, name: string) => {
    try {
      await approveRestaurant.mutateAsync({ id, status: "suspended" });
      toast({ title: "Restaurant Suspended", description: `${name} has been suspended.` });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to suspend restaurant" });
    }
  };

  const handleRoleChange = async (userId: string, newRole: string, userName: string) => {
    try {
      await updateUser.mutateAsync({ id: userId, role: newRole });
      toast({ title: "Role Updated", description: `${userName} is now a ${newRole.replace("_", " ")}.` });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to update role" });
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    try {
      await deleteUser.mutateAsync(deleteUserId);
      toast({ title: "User Deleted", description: "User has been removed from the system." });
      setDeleteUserId(null);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete user" });
    }
  };

  const handleReservationStatus = async (id: string, status: string) => {
    try {
      await updateReservation.mutateAsync({ id, status });
      toast({ title: "Reservation Updated", description: `Status changed to ${status}.` });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to update reservation" });
    }
  };

  const handleOrderStatus = async (id: string, status: string) => {
    try {
      await updateOrder.mutateAsync({ id, status });
      toast({ title: "Order Updated", description: `Status changed to ${status}.` });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to update order" });
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "border-emerald-500/50 text-emerald-500 bg-emerald-500/10",
      pending: "border-amber-500/50 text-amber-500 bg-amber-500/10",
      suspended: "border-rose-500/50 text-rose-500 bg-rose-500/10",
      confirmed: "border-emerald-500/50 text-emerald-500 bg-emerald-500/10",
      completed: "border-slate-500/50 text-slate-500 bg-slate-500/10",
      cancelled: "border-rose-500/50 text-rose-500 bg-rose-500/10",
      preparing: "border-blue-500/50 text-blue-500 bg-blue-500/10",
      ready: "border-emerald-500/50 text-emerald-500 bg-emerald-500/10",
      served: "border-slate-500/50 text-slate-500 bg-slate-500/10",
    };
    return (
      <Badge variant="outline" className={`capitalize ${styles[status] || styles.pending}`}>
        {status}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: "border-primary/50 text-primary bg-primary/10",
      restaurant_owner: "border-blue-500/50 text-blue-500 bg-blue-500/10",
      customer: "border-slate-500/50 text-slate-400 bg-slate-500/10",
    };
    return (
      <Badge variant="outline" className={`capitalize ${styles[role] || styles.customer}`}>
        {role.replace("_", " ")}
      </Badge>
    );
  };

  const adminStats = [
    { label: "Total Users", value: stats?.users || 0, icon: Users, color: "text-blue-500" },
    { label: "Restaurants", value: stats?.restaurants || 0, icon: Store, color: "text-emerald-500" },
    { label: "Reservations", value: stats?.reservations || 0, icon: Calendar, color: "text-purple-500" },
    { label: "Orders", value: stats?.orders || 0, icon: ShoppingBag, color: "text-amber-500" },
    { label: "Pending Approvals", value: stats?.pendingApprovals || 0, icon: Settings, color: "text-rose-500" },
    { label: "Pending Reservations", value: stats?.pendingReservations || 0, icon: ClipboardList, color: "text-cyan-500" },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="mb-8">
        <h1 className="font-heading text-3xl text-white mb-2">Admin Control Center</h1>
        <p className="text-muted-foreground">Full platform management and oversight.</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-card/50 border border-white/5 h-auto flex-wrap">
          <TabsTrigger value="overview" className="gap-2" data-testid="tab-overview">
            <BarChart3 className="w-4 h-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2" data-testid="tab-users">
            <UserCog className="w-4 h-4" /> Users
          </TabsTrigger>
          <TabsTrigger value="restaurants" className="gap-2" data-testid="tab-restaurants">
            <Store className="w-4 h-4" /> Restaurants
          </TabsTrigger>
          <TabsTrigger value="reservations" className="gap-2" data-testid="tab-reservations">
            <Calendar className="w-4 h-4" /> Reservations
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2" data-testid="tab-orders">
            <ShoppingBag className="w-4 h-4" /> Orders
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {statsLoading ? (
              <div className="col-span-full flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : (
              adminStats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <Card key={i} className="bg-card/50 border-white/5 backdrop-blur-sm" data-testid={`card-stat-${i}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-white">{stat.value}</div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card/50 border-white/5">
              <CardHeader>
                <CardTitle className="text-white">Recent Users</CardTitle>
                <CardDescription>Latest registered accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users?.slice(0, 5).map(user => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {user.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-white">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      {getRoleBadge(user.role)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-white/5">
              <CardHeader>
                <CardTitle className="text-white">Pending Approvals</CardTitle>
                <CardDescription>Restaurants awaiting review</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {restaurants?.filter(r => r.status === "pending").slice(0, 5).map(restaurant => (
                    <div key={restaurant.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={restaurant.image || ""} alt="" className="w-10 h-10 rounded object-cover" />
                        <div>
                          <p className="text-sm font-medium text-white">{restaurant.name}</p>
                          <p className="text-xs text-muted-foreground">{restaurant.cuisine}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-emerald-500" onClick={() => handleApprove(restaurant.id, restaurant.name)}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-rose-500" onClick={() => handleReject(restaurant.id, restaurant.name)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(!restaurants || restaurants.filter(r => r.status === "pending").length === 0) && (
                    <p className="text-muted-foreground text-sm text-center py-4">No pending approvals</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-white">User Management</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-muted-foreground">User</TableHead>
                      <TableHead className="text-muted-foreground">Email</TableHead>
                      <TableHead className="text-muted-foreground">Role</TableHead>
                      <TableHead className="text-muted-foreground">Joined</TableHead>
                      <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map(user => (
                      <TableRow key={user.id} className="border-white/5 hover:bg-white/5" data-testid={`row-user-${user.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {user.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-white">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          <Select 
                            value={user.role} 
                            onValueChange={(value) => handleRoleChange(user.id, value, user.name)}
                            disabled={updateUser.isPending}
                          >
                            <SelectTrigger className="w-40 bg-transparent border-white/10 h-8" data-testid={`select-role-${user.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-white/10">
                              <SelectItem value="customer">Customer</SelectItem>
                              <SelectItem value="restaurant_owner">Restaurant Owner</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-rose-500 hover:text-rose-400 hover:bg-rose-500/20"
                            onClick={() => setDeleteUserId(user.id)}
                            data-testid={`button-delete-user-${user.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Restaurants Tab */}
        <TabsContent value="restaurants">
          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Restaurant Management</CardTitle>
              <CardDescription>Approve, suspend, or manage restaurants</CardDescription>
            </CardHeader>
            <CardContent>
              {restaurantsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Restaurant</TableHead>
                      <TableHead className="text-muted-foreground">Cuisine</TableHead>
                      <TableHead className="text-muted-foreground">Location</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {restaurants?.map(restaurant => (
                      <TableRow key={restaurant.id} className="border-white/5 hover:bg-white/5" data-testid={`row-restaurant-${restaurant.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img src={restaurant.image || ""} alt="" className="w-10 h-10 rounded-md object-cover" />
                            <span className="font-medium text-white">{restaurant.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{restaurant.cuisine}</TableCell>
                        <TableCell className="text-muted-foreground">{restaurant.address?.split(",")[0] || "N/A"}</TableCell>
                        <TableCell>{getStatusBadge(restaurant.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {restaurant.status === "pending" && (
                              <>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-emerald-500" onClick={() => handleApprove(restaurant.id, restaurant.name)} data-testid={`button-approve-${restaurant.id}`}>
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-rose-500" onClick={() => handleReject(restaurant.id, restaurant.name)} data-testid={`button-reject-${restaurant.id}`}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {restaurant.status === "active" && (
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-rose-500" onClick={() => handleReject(restaurant.id, restaurant.name)}>
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                            {restaurant.status === "suspended" && (
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-emerald-500" onClick={() => handleApprove(restaurant.id, restaurant.name)}>
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reservations Tab */}
        <TabsContent value="reservations">
          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-white">All Reservations</CardTitle>
              <CardDescription>View and manage all platform reservations</CardDescription>
            </CardHeader>
            <CardContent>
              {reservationsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
              ) : reservations && reservations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Code</TableHead>
                      <TableHead className="text-muted-foreground">Restaurant</TableHead>
                      <TableHead className="text-muted-foreground">Date & Time</TableHead>
                      <TableHead className="text-muted-foreground">Guests</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservations.map(res => {
                      const restaurant = allRestaurants?.find(r => r.id === res.restaurantId);
                      return (
                        <TableRow key={res.id} className="border-white/5 hover:bg-white/5" data-testid={`row-reservation-${res.id}`}>
                          <TableCell className="font-mono text-primary">{res.confirmationCode || res.id.slice(-6)}</TableCell>
                          <TableCell className="text-white">{restaurant?.name || "Unknown"}</TableCell>
                          <TableCell className="text-muted-foreground">{res.date} at {res.time}</TableCell>
                          <TableCell className="text-muted-foreground">{res.partySize}</TableCell>
                          <TableCell>{getStatusBadge(res.status)}</TableCell>
                          <TableCell className="text-right">
                            <Select 
                              value={res.status} 
                              onValueChange={(value) => handleReservationStatus(res.id, value)}
                              disabled={updateReservation.isPending}
                            >
                              <SelectTrigger className="w-32 bg-transparent border-white/10 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-card border-white/10">
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">No reservations found</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-white">All Orders</CardTitle>
              <CardDescription>View and manage all platform orders</CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
              ) : orders && orders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Order ID</TableHead>
                      <TableHead className="text-muted-foreground">Restaurant</TableHead>
                      <TableHead className="text-muted-foreground">Customer</TableHead>
                      <TableHead className="text-muted-foreground">Total</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map(order => {
                      const restaurant = allRestaurants?.find(r => r.id === order.restaurantId);
                      return (
                        <TableRow key={order.id} className="border-white/5 hover:bg-white/5" data-testid={`row-order-${order.id}`}>
                          <TableCell className="font-mono text-primary">#{order.id.slice(-6)}</TableCell>
                          <TableCell className="text-white">{restaurant?.name || "Unknown"}</TableCell>
                          <TableCell className="text-muted-foreground">{order.customerName || "Guest"}</TableCell>
                          <TableCell className="text-white">${order.total}</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell className="text-right">
                            <Select 
                              value={order.status} 
                              onValueChange={(value) => handleOrderStatus(order.id, value)}
                              disabled={updateOrder.isPending}
                            >
                              <SelectTrigger className="w-32 bg-transparent border-white/10 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-card border-white/10">
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="preparing">Preparing</SelectItem>
                                <SelectItem value="ready">Ready</SelectItem>
                                <SelectItem value="served">Served</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">No orders found</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <DialogContent className="bg-card border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="font-heading">Delete User</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Are you sure you want to delete this user? This action cannot be undone.</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleDeleteUser}
              className="bg-rose-500 text-white hover:bg-rose-600"
              disabled={deleteUser.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteUser.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
