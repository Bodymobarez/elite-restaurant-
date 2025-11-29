import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { useOrders, useMenu, useUpdateOrder, useUpdateMenuItem, useCreateMenuItem, useDeleteMenuItem } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, DollarSign, ShoppingBag, Clock, Loader2, ChefHat, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Restaurant } from "@shared/schema";

export default function RestaurantDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    category: "Mains",
    image: ""
  });
  
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
  const { data: orders, isLoading: ordersLoading, refetch: refetchOrders } = useOrders(myRestaurant?.id);
  const { data: menuItems, isLoading: menuLoading } = useMenu(myRestaurant?.id || "");
  const updateOrder = useUpdateOrder();
  const updateMenuItem = useUpdateMenuItem();
  const createMenuItem = useCreateMenuItem();
  const deleteMenuItem = useDeleteMenuItem();

  const handleToggleAvailability = async (itemId: string, currentlyAvailable: boolean) => {
    try {
      await updateMenuItem.mutateAsync({ id: itemId, available: !currentlyAvailable });
      toast({
        title: currentlyAvailable ? "Item Unavailable" : "Item Available",
        description: `Menu item has been marked as ${currentlyAvailable ? "unavailable" : "available"}.`,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update item availability",
      });
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateOrder.mutateAsync({ id: orderId, status: newStatus });
      toast({
        title: "Order Updated",
        description: `Order status changed to ${newStatus}.`,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update order status",
      });
    }
  };

  const handleAddMenuItem = async () => {
    if (!myRestaurant || !newItem.name || !newItem.price) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill in name and price.",
      });
      return;
    }

    try {
      await createMenuItem.mutateAsync({
        restaurantId: myRestaurant.id,
        name: newItem.name,
        description: newItem.description || undefined,
        price: newItem.price,
        category: newItem.category,
        image: newItem.image || undefined,
      });
      toast({
        title: "Item Added",
        description: `${newItem.name} has been added to your menu.`,
      });
      setNewItem({ name: "", description: "", price: "", category: "Mains", image: "" });
      setAddItemOpen(false);
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add menu item",
      });
    }
  };

  const handleDeleteMenuItem = async (itemId: string, itemName: string) => {
    try {
      await deleteMenuItem.mutateAsync(itemId);
      toast({
        title: "Item Deleted",
        description: `${itemName} has been removed from your menu.`,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete menu item",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/50';
      case 'preparing': return 'bg-blue-500/10 text-blue-500 border-blue-500/50';
      case 'ready': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/50';
      case 'served': return 'bg-slate-500/10 text-slate-500 border-slate-500/50';
      case 'cancelled': return 'bg-rose-500/10 text-rose-500 border-rose-500/50';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/50';
    }
  };

  const getNextStatus = (currentStatus: string): string | null => {
    switch (currentStatus) {
      case 'pending': return 'preparing';
      case 'preparing': return 'ready';
      case 'ready': return 'served';
      default: return null;
    }
  };

  const activeOrders = orders?.filter(o => o.status !== 'served' && o.status !== 'cancelled') || [];
  const todaysRevenue = orders?.filter(o => o.status === 'served')
    .reduce((sum, o) => sum + parseFloat(o.total || "0"), 0) || 0;

  if (!myRestaurant) {
    return (
      <DashboardLayout role="restaurant">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <ChefHat className="w-16 h-16 text-primary mb-6" />
          <h2 className="font-heading text-2xl text-white mb-4">No Restaurant Found</h2>
          <p className="text-muted-foreground mb-6">You haven't registered a restaurant yet.</p>
          <Button className="bg-primary text-primary-foreground" onClick={() => window.location.href = "/onboarding"} data-testid="button-register-restaurant">
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
            <div className="text-2xl font-bold text-white" data-testid="text-revenue">${todaysRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white" data-testid="text-active-orders">{activeOrders.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Menu Items</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white" data-testid="text-menu-items">{menuItems?.length || 0}</div>
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
                  {orders.map((order) => {
                    const nextStatus = getNextStatus(order.status);
                    return (
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
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-end gap-2">
                            <span className="font-medium text-white">${order.total}</span>
                            <Badge variant="outline" className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                          {nextStatus && (
                            <Button
                              size="sm"
                              className="bg-primary text-primary-foreground hover:bg-primary/90"
                              onClick={() => handleUpdateOrderStatus(order.id, nextStatus)}
                              disabled={updateOrder.isPending}
                              data-testid={`button-update-order-${order.id}`}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Mark {nextStatus}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
              <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2" data-testid="button-add-menu-item">
                    <Plus className="w-4 h-4" /> Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle className="font-heading">Add New Menu Item</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-sm text-white/80 mb-2 block">Name *</label>
                      <Input 
                        value={newItem.name} 
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        placeholder="e.g., Truffle Risotto"
                        className="bg-background/50 border-white/10"
                        data-testid="input-item-name"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-white/80 mb-2 block">Description</label>
                      <Textarea 
                        value={newItem.description} 
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                        placeholder="Describe your dish..."
                        className="bg-background/50 border-white/10 resize-none"
                        rows={3}
                        data-testid="input-item-description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-white/80 mb-2 block">Price *</label>
                        <Input 
                          value={newItem.price} 
                          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                          placeholder="29.99"
                          type="number"
                          step="0.01"
                          className="bg-background/50 border-white/10"
                          data-testid="input-item-price"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-white/80 mb-2 block">Category</label>
                        <Select value={newItem.category} onValueChange={(v) => setNewItem({ ...newItem, category: v })}>
                          <SelectTrigger className="bg-background/50 border-white/10" data-testid="select-item-category">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-white/10">
                            <SelectItem value="Starters">Starters</SelectItem>
                            <SelectItem value="Mains">Mains</SelectItem>
                            <SelectItem value="Desserts">Desserts</SelectItem>
                            <SelectItem value="Drinks">Drinks</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-white/80 mb-2 block">Image URL</label>
                      <Input 
                        value={newItem.image} 
                        onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                        placeholder="https://..."
                        className="bg-background/50 border-white/10"
                        data-testid="input-item-image"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">Cancel</Button>
                    </DialogClose>
                    <Button 
                      onClick={handleAddMenuItem} 
                      className="bg-primary text-primary-foreground"
                      disabled={createMenuItem.isPending}
                      data-testid="button-save-menu-item"
                    >
                      {createMenuItem.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Item"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                            <div>
                              <p>{item.name}</p>
                              {item.description && (
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">{item.description}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{item.category}</TableCell>
                        <TableCell className="text-white">{parseFloat(item.price).toLocaleString()} EGP</TableCell>
                        <TableCell>
                          <Switch 
                            checked={item.available} 
                            onCheckedChange={() => handleToggleAvailability(item.id, item.available)}
                            disabled={updateMenuItem.isPending}
                            data-testid={`switch-availability-${item.id}`}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-rose-500 hover:text-rose-400 hover:bg-rose-500/20"
                              onClick={() => handleDeleteMenuItem(item.id, item.name)}
                              disabled={deleteMenuItem.isPending}
                              data-testid={`button-delete-${item.id}`}
                            >
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
