import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminStats, useAdminRestaurants, useApproveRestaurant } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, MoreHorizontal, TrendingUp, Coffee, Users, Settings, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: restaurants, isLoading: restaurantsLoading } = useAdminRestaurants();
  const approveRestaurant = useApproveRestaurant();
  const { toast } = useToast();

  const handleApprove = async (id: string, name: string) => {
    try {
      await approveRestaurant.mutateAsync({ id, status: "active" });
      toast({
        title: "Restaurant Approved",
        description: `${name} has been approved and is now live.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to approve restaurant",
      });
    }
  };

  const handleReject = async (id: string, name: string) => {
    try {
      await approveRestaurant.mutateAsync({ id, status: "suspended" });
      toast({
        title: "Restaurant Suspended",
        description: `${name} has been suspended.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to suspend restaurant",
      });
    }
  };

  const adminStats = [
    { label: "Active Restaurants", value: stats?.restaurants || 0, change: "+3", icon: Coffee },
    { label: "Total Users", value: stats?.users || 0, change: "+8.2%", icon: Users },
    { label: "Total Orders", value: stats?.orders || 0, change: "+12%", icon: TrendingUp },
    { label: "Pending Approvals", value: stats?.pendingApprovals || 0, change: "-2", icon: Settings },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="mb-8">
        <h1 className="font-heading text-3xl text-white mb-2">Admin Overview</h1>
        <p className="text-muted-foreground">Platform performance and restaurant management.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsLoading ? (
          <div className="col-span-4 flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : (
          adminStats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="bg-card/50 border-white/5 backdrop-blur-sm" data-testid={`card-stat-${i}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <p className={`text-xs mt-1 ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {stat.change} from last month
                  </p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Restaurants Table */}
      <Card className="bg-card/50 border-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-heading text-white">Restaurant Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {restaurantsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
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
                {restaurants?.map((restaurant) => (
                  <TableRow key={restaurant.id} className="border-white/5 hover:bg-white/5 transition-colors" data-testid={`row-restaurant-${restaurant.id}`}>
                    <TableCell className="font-medium text-white">
                      <div className="flex items-center gap-3">
                        <img 
                          src={restaurant.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"} 
                          alt="" 
                          className="w-10 h-10 rounded-md object-cover" 
                        />
                        {restaurant.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{restaurant.cuisine}</TableCell>
                    <TableCell className="text-muted-foreground">{restaurant.address?.split(",")[0] || "N/A"}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`capitalize ${
                          restaurant.status === 'active' ? 'border-emerald-500/50 text-emerald-500 bg-emerald-500/10' : 
                          restaurant.status === 'pending' ? 'border-amber-500/50 text-amber-500 bg-amber-500/10' : 
                          'border-rose-500/50 text-rose-500 bg-rose-500/10'
                        }`}
                      >
                        {restaurant.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {restaurant.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/20"
                              onClick={() => handleApprove(restaurant.id, restaurant.name)}
                              disabled={approveRestaurant.isPending}
                              data-testid={`button-approve-${restaurant.id}`}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-rose-500 hover:text-rose-400 hover:bg-rose-500/20"
                              onClick={() => handleReject(restaurant.id, restaurant.name)}
                              disabled={approveRestaurant.isPending}
                              data-testid={`button-reject-${restaurant.id}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-white">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-white/10 text-white">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Contact Owner</DropdownMenuItem>
                            <DropdownMenuItem className="text-rose-500">Suspend Account</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!restaurants || restaurants.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No restaurants found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
