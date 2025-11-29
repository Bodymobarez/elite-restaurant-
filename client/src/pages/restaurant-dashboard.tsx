import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { restaurants, menuItems, recentOrders } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit2, Trash2, DollarSign, ShoppingBag, Clock } from "lucide-react";

export default function RestaurantDashboard() {
  const myRestaurant = restaurants[0];

  return (
    <DashboardLayout role="restaurant">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-heading text-3xl text-white mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {myRestaurant.name}</p>
        </div>
        <div className="flex gap-3">
           <div className="flex items-center gap-2 bg-card/50 px-4 py-2 rounded-lg border border-white/5">
             <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-sm font-medium text-emerald-500">Open for Orders</span>
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
            <div className="text-2xl font-bold text-white">${myRestaurant.revenueToday}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{myRestaurant.ordersToday}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Prep Time</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">24m</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="bg-card/50 border border-white/5">
          <TabsTrigger value="orders">Live Orders</TabsTrigger>
          <TabsTrigger value="menu">Menu Management</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Incoming Orders</CardTitle>
              <CardDescription>Real-time order updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border border-white/5 rounded-lg bg-white/[0.02]">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center text-primary font-bold">
                        #{order.id.split('-')[1]}
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{order.customer}</h4>
                        <p className="text-sm text-muted-foreground">{order.items.join(", ")}</p>
                        <p className="text-xs text-muted-foreground mt-1">{order.time}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="font-medium text-white">${order.total}</span>
                      <Badge 
                        variant="outline" 
                        className={
                          order.status === 'Preparing' ? 'bg-amber-500/10 text-amber-500 border-amber-500/50' :
                          order.status === 'Ready' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/50' :
                          'bg-blue-500/10 text-blue-500 border-blue-500/50'
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
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
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                <Plus className="w-4 h-4" /> Add Item
              </Button>
            </CardHeader>
            <CardContent>
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
                    <TableRow key={item.id} className="border-white/5 hover:bg-white/5">
                      <TableCell className="font-medium text-white">
                        <div className="flex items-center gap-3">
                          <img src={item.image} alt="" className="w-8 h-8 rounded object-cover" />
                          {item.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{item.category}</TableCell>
                      <TableCell className="text-white">${item.price}</TableCell>
                      <TableCell>
                        <Switch checked={item.available} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-white">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-rose-500 hover:text-rose-400 hover:bg-rose-500/20">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
