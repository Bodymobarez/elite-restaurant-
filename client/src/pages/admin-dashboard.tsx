import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminStats, restaurants } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function AdminDashboard() {
  return (
    <DashboardLayout role="admin">
      <div className="mb-8">
        <h1 className="font-heading text-3xl text-white mb-2">Admin Overview</h1>
        <p className="text-muted-foreground">Platform performance and restaurant management.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {adminStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="bg-card/50 border-white/5 backdrop-blur-sm">
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
        })}
      </div>

      {/* Restaurants Table */}
      <Card className="bg-card/50 border-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-heading text-white">Restaurant Applications</CardTitle>
        </CardHeader>
        <CardContent>
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
              {restaurants.map((restaurant) => (
                <TableRow key={restaurant.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell className="font-medium text-white">
                    <div className="flex items-center gap-3">
                      <img src={restaurant.image} alt="" className="w-10 h-10 rounded-md object-cover" />
                      {restaurant.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{restaurant.cuisine}</TableCell>
                  <TableCell className="text-muted-foreground">{restaurant.location}</TableCell>
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
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/20">
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-rose-500 hover:text-rose-400 hover:bg-rose-500/20">
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
