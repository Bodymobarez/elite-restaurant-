import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { useOrders, useMenu, useUpdateOrder, useUpdateMenuItem } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit2, Trash2, DollarSign, ShoppingBag, Clock, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Restaurant } from "@shared/schema";

export default function RestaurantDashboard() {
  const { user } = useAuth();
  
  const { data: myRestaurants } = useQuery<Restaurant[]>({
    queryKey: ["/api/owner/restaurants"],
    queryFn: async () => {
      const res = await fetch("/api/restaurants");
      if (!res.ok) return [];
      const all = await res.json();
      return all.filter((r: Restaurant) => r.ownerId === user?.id);
    },
    enabled: !!user,
  });

  const myRestaurant = myRestaurants?.[0];
  const { data: orders, isLoading: ordersLoading } = useOrders(myRestaurant?.id);
  const { data: menuItems, isLoading: menuLoading } = useMenu(myRestaurant?.id || "");
  const updateOrder = useUpdateOrder();
  const updateMenuItem = useUpdateMenuItem();

  const handleToggleAvailability = async (itemId: string, currentlyAvailable: boolean) => {
    await updateMenuItem.mutateAsync({ id: itemId, available: !currentlyAvailable });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/50';
      case 'preparing': return 'bg-blue-500/10 text-blue-500 border-blue-500/50';
      case 'ready': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/50';
      case 'served': return 'bg-slate-500/10 text-slate-500 border-slate-500/50';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/50';
    }
  };

  if (!myRestaurant) {
    return (
      <DashboardLayout role="restaurant">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h2 className="font-heading text-2xl text-white mb-4">No Restaurant Found</h2>
          <p className="text-muted-foreground mb-6">You haven't registered a restaurant yet.</p>
          <Button className="bg-primary text-primary-foreground" onClick={() => window.location.href = "/onboarding"}>
            Register Your Restaurant
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="restaurant">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-heading text-3xl text-white mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {myRestaurant.name}</p>
        </div>
        <div className="flex gap-3">
           <div className="flex items-center gap-2 bg-card/50 px-4 py-2 rounded-lg border border-white/5">
             <span className={`h-2 w-2 rounded-full ${myRestaurant.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
             <span className={`text-sm font-medium ${myRestaurant.status === 'active' ? 'text-emerald-500' : 'text-amber-500'}`}>
               {myRestaurant.status === 'active' ? 'Open for Orders' : 'Pending Approval'}
             </span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-card/50 border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">$0</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{orders?.filter(o => o.status !== 'served' && o.status !== 'cancelled').length || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Menu Items</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{menuItems?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="bg-card/50 border border-white/5">
          <TabsTrigger value="orders" data-testid="tab-orders">Live Orders</TabsTrigger>
          <TabsTrigger value="menu" data-testid="tab-menu">Menu Management</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Incoming Orders</CardTitle>
              <CardDescription>Real-time order updates</CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border border-white/5 rounded-lg bg-white/[0.02]" data-testid={`card-order-${order.id}`}>
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center text-primary font-bold">
                          #{order.id.slice(-4)}
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{order.customerName || "Guest"}</h4>
                          <p className="text-sm text-muted-foreground">Order #{order.id.slice(-6)}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : "Just now"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="font-medium text-white">${order.total}</span>
                        <Badge variant="outline" className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No orders yet. They'll appear here in real-time.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu">
          <Card className="bg-card/50 border-white/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Menu Items</CardTitle>
                <CardDescription>Manage your offerings and availability</CardDescription>
              </div>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2" data-testid="button-add-menu-item">
                <Plus className="w-4 h-4" /> Add Item
              </Button>
            </CardHeader>
            <CardContent>
              {menuLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : menuItems && menuItems.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Item</TableHead>
                      <TableHead className="text-muted-foreground">Category</TableHead>
                      <TableHead className="text-muted-foreground">Price</TableHead>
                      <TableHead className="text-muted-foreground">Available</TableHead>
                      <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {menuItems.map((item) => (
                      <TableRow key={item.id} className="border-white/5 hover:bg-white/5" data-testid={`row-menu-item-${item.id}`}>
                        <TableCell className="font-medium text-white">
                          <div className="flex items-center gap-3">
                            <img 
                              src={item.image || "https://images.unsplash.com/photo-1476124369491-e7addf5db371?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"} 
                              alt="" 
                              className="w-8 h-8 rounded object-cover" 
                            />
                            {item.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{item.category}</TableCell>
                        <TableCell className="text-white">${item.price}</TableCell>
                        <TableCell>
                          <Switch 
                            checked={item.available} 
                            onCheckedChange={() => handleToggleAvailability(item.id, item.available)}
                            data-testid={`switch-availability-${item.id}`}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-white" data-testid={`button-edit-${item.id}`}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-rose-500 hover:text-rose-400 hover:bg-rose-500/20" data-testid={`button-delete-${item.id}`}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No menu items yet. Add your first dish to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
