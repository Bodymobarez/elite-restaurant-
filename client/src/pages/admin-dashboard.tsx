import { useState } from "react";
import { Link } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  useAdminStats, useAdminRestaurants, useApproveRestaurant,
  useAdminUsers, useUpdateAdminUser, useDeleteAdminUser,
  useAdminReservations, useUpdateAdminReservation,
  useAdminOrders, useUpdateAdminOrder, useRestaurants,
  useActivityLogs, useNotifications, useMarkNotificationRead,
  useDeleteNotification, useRevenueAnalytics, useUserGrowth, useTopRestaurants
} from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Check, X, MoreHorizontal, TrendingUp, Coffee, Users, Settings, Loader2, 
  Calendar, ShoppingBag, UserCog, Store, ClipboardList, BarChart3, Trash2, Shield,
  Search, Filter, Download, Eye, Edit, Mail, Phone, MapPin, DollarSign, Activity,
  AlertCircle, CheckCircle, Clock, Ban, RefreshCw, FileText, PieChart, TrendingDown,
  Bell, BellOff, MessageSquare, Star, ExternalLink, Info, XCircle
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export default function AdminDashboard({ defaultTab = "overview" }: { defaultTab?: string }) {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: restaurants, isLoading: restaurantsLoading } = useAdminRestaurants();
  const { data: allRestaurants } = useRestaurants();
  const { data: users, isLoading: usersLoading } = useAdminUsers();
  const { data: reservations, isLoading: reservationsLoading } = useAdminReservations();
  const { data: orders, isLoading: ordersLoading } = useAdminOrders();
  const { data: activityLogs, isLoading: logsLoading } = useActivityLogs(50);
  const { data: notifications, isLoading: notificationsLoading } = useNotifications();
  const { data: revenueData } = useRevenueAnalytics();
  const { data: userGrowthData } = useUserGrowth();
  const { data: topRestaurantsData } = useTopRestaurants();
  
  const approveRestaurant = useApproveRestaurant();
  const updateUser = useUpdateAdminUser();
  const deleteUser = useDeleteAdminUser();
  const updateReservation = useUpdateAdminReservation();
  const updateOrder = useUpdateAdminOrder();
  const markNotificationRead = useMarkNotificationRead();
  const deleteNotification = useDeleteNotification();

  const handleApprove = async (id: string, name: string) => {
    try {
      await approveRestaurant.mutateAsync({ id, status: "active" });
      toast({ 
        title: t('adminDashboard.restaurantApproved', 'Restaurant Approved'), 
        description: `${name} ${t('adminDashboard.nowLive', 'is now live')}.` 
      });
      setSelectedRestaurant(null);
    } catch {
      toast({ 
        variant: "destructive", 
        title: t('common.error', 'Error'), 
        description: t('adminDashboard.approvalFailed', 'Failed to approve restaurant') 
      });
    }
  };

  const handleReject = async (id: string, name: string) => {
    try {
      await approveRestaurant.mutateAsync({ id, status: "suspended" });
      toast({ 
        title: t('adminDashboard.restaurantSuspended', 'Restaurant Suspended'), 
        description: `${name} ${t('adminDashboard.hasBeenSuspended', 'has been suspended')}.` 
      });
      setSelectedRestaurant(null);
    } catch {
      toast({ 
        variant: "destructive", 
        title: t('common.error', 'Error'), 
        description: t('adminDashboard.suspensionFailed', 'Failed to suspend restaurant') 
      });
    }
  };

  const handleRoleChange = async (userId: string, newRole: string, userName: string) => {
    try {
      await updateUser.mutateAsync({ id: userId, role: newRole });
      toast({ 
        title: t('adminDashboard.roleUpdated', 'Role Updated'), 
        description: `${userName} ${t('adminDashboard.isNow', 'is now')} ${t(`adminDashboard.${newRole}`, newRole.replace("_", " "))}.` 
      });
    } catch {
      toast({ 
        variant: "destructive", 
        title: t('common.error', 'Error'), 
        description: t('adminDashboard.roleUpdateFailed', 'Failed to update role') 
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    try {
      await deleteUser.mutateAsync(deleteUserId);
      toast({ 
        title: t('adminDashboard.userDeleted', 'User Deleted'), 
        description: t('adminDashboard.userRemoved', 'User has been removed from the system.') 
      });
      setDeleteUserId(null);
    } catch {
      toast({ 
        variant: "destructive", 
        title: t('common.error', 'Error'), 
        description: t('adminDashboard.deleteFailed', 'Failed to delete user') 
      });
    }
  };

  const handleReservationStatus = async (id: string, status: string) => {
    try {
      await updateReservation.mutateAsync({ id, status });
      toast({ 
        title: t('adminDashboard.reservationUpdated', 'Reservation Updated'), 
        description: `${t('adminDashboard.statusChanged', 'Status changed to')} ${t(`common.${status}`, status)}.` 
      });
      setSelectedReservation(null);
    } catch {
      toast({ 
        variant: "destructive", 
        title: t('common.error', 'Error'), 
        description: t('adminDashboard.updateFailed', 'Failed to update reservation') 
      });
    }
  };

  const handleOrderStatus = async (id: string, status: string) => {
    try {
      await updateOrder.mutateAsync({ id, status });
      toast({ 
        title: t('adminDashboard.orderUpdated', 'Order Updated'), 
        description: `${t('adminDashboard.statusChanged', 'Status changed to')} ${t(`common.${status}`, status)}.` 
      });
      setSelectedOrder(null);
    } catch {
      toast({ 
        variant: "destructive", 
        title: t('common.error', 'Error'), 
        description: t('adminDashboard.updateFailed', 'Failed to update order') 
      });
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

  // Filter functions
  const filteredUsers = users?.filter(user => 
    (filterStatus === "all" || user.role === filterStatus) &&
    (searchQuery === "" || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredRestaurants = restaurants?.filter(restaurant =>
    (filterStatus === "all" || restaurant.status === filterStatus) &&
    (searchQuery === "" || 
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredReservations = reservations?.filter(reservation =>
    (filterStatus === "all" || reservation.status === filterStatus) &&
    (searchQuery === "" || 
      reservation.confirmationCode?.includes(searchQuery) ||
      reservation.id.includes(searchQuery))
  );

  const filteredOrders = orders?.filter(order =>
    (filterStatus === "all" || order.status === filterStatus) &&
    (searchQuery === "" || 
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.includes(searchQuery))
  );

  const adminStats = [
    { 
      label: t('adminDashboard.totalUsers', 'Total Users'), 
      value: stats?.users || 0, 
      icon: Users, 
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      trend: "+12%",
      trendUp: true
    },
    { 
      label: t('adminDashboard.totalRestaurants', 'Restaurants'), 
      value: stats?.restaurants || 0, 
      icon: Store, 
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      trend: "+8%",
      trendUp: true
    },
    { 
      label: t('adminDashboard.totalReservations', 'Reservations'), 
      value: stats?.reservations || 0, 
      icon: Calendar, 
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      trend: "+23%",
      trendUp: true
    },
    { 
      label: t('adminDashboard.totalOrders', 'Orders'), 
      value: stats?.orders || 0, 
      icon: ShoppingBag, 
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      trend: "+15%",
      trendUp: true
    },
    { 
      label: t('adminDashboard.pendingApprovals', 'Pending Approvals'), 
      value: stats?.pendingApprovals || 0, 
      icon: AlertCircle, 
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
      trend: "-5%",
      trendUp: false
    },
    { 
      label: t('adminDashboard.pendingReservations', 'Pending Reservations'), 
      value: stats?.pendingReservations || 0, 
      icon: Clock, 
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      trend: "+10%",
      trendUp: true
    },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-heading text-3xl text-white mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            {t('adminDashboard.controlCenter', 'Admin Control Center')}
          </h1>
          <p className="text-muted-foreground">{t('adminDashboard.fullPlatformManagement', 'Full platform management and oversight.')}</p>
        </div>
        <Link href="/admin/settings">
          <Button className="bg-primary/20 text-primary border border-primary/50 hover:bg-primary/30">
            <Settings className="w-4 h-4 mr-2" />
            {t('settings.platformSettings', 'Platform Settings')}
          </Button>
        </Link>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="bg-card/50 border border-white/5 h-auto flex-wrap">
          <TabsTrigger value="overview" className="gap-2" data-testid="tab-overview">
            <BarChart3 className="w-4 h-4" /> {t('adminDashboard.overview', 'Overview')}
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2" data-testid="tab-users">
            <UserCog className="w-4 h-4" /> {t('adminDashboard.users', 'Users')}
          </TabsTrigger>
          <TabsTrigger value="restaurants" className="gap-2" data-testid="tab-restaurants">
            <Store className="w-4 h-4" /> {t('adminDashboard.restaurants', 'Restaurants')}
          </TabsTrigger>
          <TabsTrigger value="reservations" className="gap-2" data-testid="tab-reservations">
            <Calendar className="w-4 h-4" /> {t('adminDashboard.reservations', 'Reservations')}
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2" data-testid="tab-orders">
            <ShoppingBag className="w-4 h-4" /> {t('adminDashboard.orders', 'Orders')}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2" data-testid="tab-analytics">
            <PieChart className="w-4 h-4" /> {t('adminDashboard.analytics', 'Analytics')}
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2" data-testid="tab-logs">
            <Activity className="w-4 h-4" /> {t('adminDashboard.activityLogs', 'Activity Logs')}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2" data-testid="tab-notifications">
            <Bell className="w-4 h-4" /> {t('adminDashboard.notifications', 'Notifications')}
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
                  <Card key={i} className="bg-card/50 border-white/5 backdrop-blur-sm hover:border-white/10 transition-all" data-testid={`card-stat-${i}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                      <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                        <Icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end justify-between">
                        <div className="text-3xl font-bold text-white">{stat.value}</div>
                        {stat.trend && (
                          <div className={cn(
                            "flex items-center gap-1 text-xs font-medium",
                            stat.trendUp ? "text-emerald-500" : "text-rose-500"
                          )}>
                            {stat.trendUp ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {stat.trend}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card/50 border-white/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">{t('adminDashboard.recentUsers', 'Recent Users')}</CardTitle>
                    <CardDescription>{t('adminDashboard.latestRegistered', 'Latest registered accounts')}</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                    {t('adminDashboard.viewAll', 'View All')} →
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users?.slice(0, 5).map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-white/5">
                          <AvatarImage src={user.avatar || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {user.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-white">{user.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getRoleBadge(user.role)}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-white/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                      {t('adminDashboard.pendingApprovals', 'Pending Approvals')}
                    </CardTitle>
                    <CardDescription>{t('adminDashboard.restaurantsAwaitingReview', 'Restaurants awaiting review')}</CardDescription>
                  </div>
                  {restaurants?.filter(r => r.status === "pending").length > 5 && (
                    <Badge variant="outline" className="border-amber-500/50 text-amber-500">
                      +{restaurants.filter(r => r.status === "pending").length - 5}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {restaurants?.filter(r => r.status === "pending").slice(0, 5).map(restaurant => (
                    <div key={restaurant.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <img src={restaurant.image || ""} alt="" className="w-10 h-10 rounded-md object-cover border border-white/5" />
                        <div>
                          <p className="text-sm font-medium text-white">{restaurant.name}</p>
                          <p className="text-xs text-muted-foreground">{restaurant.cuisine}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-emerald-500 hover:bg-emerald-500/20" 
                          onClick={() => handleApprove(restaurant.id, restaurant.name)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-rose-500 hover:bg-rose-500/20" 
                          onClick={() => handleReject(restaurant.id, restaurant.name)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => setSelectedRestaurant(restaurant)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(!restaurants || restaurants.filter(r => r.status === "pending").length === 0) && (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-50" />
                      <p className="text-muted-foreground text-sm">{t('adminDashboard.noPendingApprovals', 'No pending approvals')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-card/50 border-white/5 mt-6">
            <CardHeader>
              <CardTitle className="text-white">{t('adminDashboard.quickActions', 'Quick Actions')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-white/10 hover:bg-white/5">
                  <RefreshCw className="w-5 h-5 text-primary" />
                  <span className="text-xs">{t('adminDashboard.refreshData', 'Refresh Data')}</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-white/10 hover:bg-white/5">
                  <Download className="w-5 h-5 text-primary" />
                  <span className="text-xs">{t('adminDashboard.exportReports', 'Export Reports')}</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-white/10 hover:bg-white/5">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="text-xs">{t('adminDashboard.viewLogs', 'View Logs')}</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-white/10 hover:bg-white/5">
                  <Settings className="w-5 h-5 text-primary" />
                  <span className="text-xs">{t('adminDashboard.systemSettings', 'System Settings')}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-white">{t('adminDashboard.userManagement', 'User Management')}</CardTitle>
                  <CardDescription>{t('adminDashboard.manageUserAccounts', 'Manage user accounts and permissions')}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder={t('adminDashboard.searchUsers', 'Search users...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64 bg-transparent border-white/10"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40 bg-transparent border-white/10">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-white/10">
                      <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
                      <SelectItem value="customer">{t('adminDashboard.customers', 'Customers')}</SelectItem>
                      <SelectItem value="restaurant_owner">{t('adminDashboard.owners', 'Owners')}</SelectItem>
                      <SelectItem value="admin">{t('adminDashboard.admins', 'Admins')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="border-white/10">
                    <Download className="w-4 h-4 mr-2" />
                    {t('common.export', 'Export')}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-muted-foreground">{t('adminDashboard.user', 'User')}</TableHead>
                      <TableHead className="text-muted-foreground">{t('adminDashboard.email', 'Email')}</TableHead>
                      <TableHead className="text-muted-foreground">{t('adminDashboard.role', 'Role')}</TableHead>
                      <TableHead className="text-muted-foreground">{t('adminDashboard.joined', 'Joined')}</TableHead>
                      <TableHead className="text-right text-muted-foreground">{t('adminDashboard.actions', 'Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers?.map(user => (
                      <TableRow key={user.id} className="border-white/5 hover:bg-white/5" data-testid={`row-user-${user.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-white/5">
                              <AvatarImage src={user.avatar || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {user.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-medium text-white block">{user.name}</span>
                              <span className="text-xs text-muted-foreground">{user.phone || 'N/A'}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={user.role} 
                            onValueChange={(value) => handleRoleChange(user.id, value, user.name)}
                            disabled={updateUser.isPending}
                          >
                            <SelectTrigger className="w-40 bg-transparent border-white/10 h-9" data-testid={`select-role-${user.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-white/10">
                              <SelectItem value="customer">{t('adminDashboard.customer', 'Customer')}</SelectItem>
                              <SelectItem value="restaurant_owner">{t('adminDashboard.restaurantOwner', 'Restaurant Owner')}</SelectItem>
                              <SelectItem value="admin">{t('adminDashboard.admin', 'Admin')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-white/5"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-rose-500 hover:text-rose-400 hover:bg-rose-500/20"
                              onClick={() => setDeleteUserId(user.id)}
                              data-testid={`button-delete-user-${user.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {filteredUsers && filteredUsers.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  {t('adminDashboard.noUsersFound', 'No users found matching your criteria')}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Restaurants Tab */}
        <TabsContent value="restaurants">
          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-white">{t('adminDashboard.restaurantManagement', 'Restaurant Management')}</CardTitle>
                  <CardDescription>{t('adminDashboard.approveManageRestaurants', 'Approve, suspend, or manage restaurants')}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder={t('adminDashboard.searchRestaurants', 'Search restaurants...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64 bg-transparent border-white/10"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40 bg-transparent border-white/10">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-white/10">
                      <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
                      <SelectItem value="active">{t('common.active', 'Active')}</SelectItem>
                      <SelectItem value="pending">{t('common.pending', 'Pending')}</SelectItem>
                      <SelectItem value="suspended">{t('common.suspended', 'Suspended')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {restaurantsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-muted-foreground">{t('adminDashboard.restaurant', 'Restaurant')}</TableHead>
                      <TableHead className="text-muted-foreground">{t('adminDashboard.cuisine', 'Cuisine')}</TableHead>
                      <TableHead className="text-muted-foreground">{t('adminDashboard.location', 'Location')}</TableHead>
                      <TableHead className="text-muted-foreground">{t('adminDashboard.contact', 'Contact')}</TableHead>
                      <TableHead className="text-muted-foreground">{t('adminDashboard.status', 'Status')}</TableHead>
                      <TableHead className="text-right text-muted-foreground">{t('adminDashboard.actions', 'Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRestaurants?.map(restaurant => (
                      <TableRow key={restaurant.id} className="border-white/5 hover:bg-white/5" data-testid={`row-restaurant-${restaurant.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img src={restaurant.image || ""} alt="" className="w-12 h-12 rounded-md object-cover border border-white/5" />
                            <div>
                              <span className="font-medium text-white block">{restaurant.name}</span>
                              <span className="text-xs text-muted-foreground">{restaurant.priceRange || 'N/A'}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{restaurant.cuisine}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-muted-foreground text-sm">
                            <MapPin className="w-3 h-3" />
                            {restaurant.address?.split(",")[0] || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-muted-foreground text-sm">
                            {restaurant.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {restaurant.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(restaurant.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-white/5"
                              onClick={() => setSelectedRestaurant(restaurant)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {restaurant.status === "pending" && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-8 w-8 p-0 text-emerald-500 hover:bg-emerald-500/20" 
                                  onClick={() => handleApprove(restaurant.id, restaurant.name)} 
                                  data-testid={`button-approve-${restaurant.id}`}
                                  title={t('adminDashboard.approve', 'Approve')}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-8 w-8 p-0 text-rose-500 hover:bg-rose-500/20" 
                                  onClick={() => handleReject(restaurant.id, restaurant.name)} 
                                  data-testid={`button-reject-${restaurant.id}`}
                                  title={t('adminDashboard.reject', 'Reject')}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {restaurant.status === "active" && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0 text-amber-500 hover:bg-amber-500/20" 
                                onClick={() => handleReject(restaurant.id, restaurant.name)}
                                title={t('adminDashboard.suspend', 'Suspend')}
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            )}
                            {restaurant.status === "suspended" && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0 text-emerald-500 hover:bg-emerald-500/20" 
                                onClick={() => handleApprove(restaurant.id, restaurant.name)}
                                title={t('adminDashboard.activate', 'Activate')}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {filteredRestaurants && filteredRestaurants.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  {t('adminDashboard.noRestaurantsFound', 'No restaurants found matching your criteria')}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reservations Tab */}
        <TabsContent value="reservations">
          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-white">{t('adminDashboard.allReservations', 'All Reservations')}</CardTitle>
                  <CardDescription>{t('adminDashboard.viewManageReservations', 'View and manage all platform reservations')}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder={t('adminDashboard.searchReservations', 'Search reservations...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64 bg-transparent border-white/10"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32 bg-transparent border-white/10">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-white/10">
                      <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
                      <SelectItem value="pending">{t('common.pending', 'Pending')}</SelectItem>
                      <SelectItem value="confirmed">{t('common.confirmed', 'Confirmed')}</SelectItem>
                      <SelectItem value="completed">{t('common.completed', 'Completed')}</SelectItem>
                      <SelectItem value="cancelled">{t('common.cancelled', 'Cancelled')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {reservationsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
              ) : filteredReservations && filteredReservations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-muted-foreground">{t('adminDashboard.code', 'Code')}</TableHead>
                      <TableHead className="text-muted-foreground">{t('adminDashboard.restaurant', 'Restaurant')}</TableHead>
                      <TableHead className="text-muted-foreground">{t('adminDashboard.dateTime', 'Date & Time')}</TableHead>
                      <TableHead className="text-muted-foreground">{t('adminDashboard.guests', 'Guests')}</TableHead>
                      <TableHead className="text-muted-foreground">{t('adminDashboard.status', 'Status')}</TableHead>
                      <TableHead className="text-right text-muted-foreground">{t('adminDashboard.actions', 'Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReservations.map(res => {
                      const restaurant = allRestaurants?.find(r => r.id === res.restaurantId);
                      return (
                        <TableRow key={res.id} className="border-white/5 hover:bg-white/5" data-testid={`row-reservation-${res.id}`}>
                          <TableCell className="font-mono text-primary">{res.confirmationCode || res.id.slice(-6)}</TableCell>
                          <TableCell className="text-white">{restaurant?.name || "Unknown"}</TableCell>
                          <TableCell className="text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {res.date} at {res.time}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{res.partySize}</TableCell>
                          <TableCell>{getStatusBadge(res.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-white/5"
                                onClick={() => setSelectedReservation(res)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Select 
                                value={res.status} 
                                onValueChange={(value) => handleReservationStatus(res.id, value)}
                                disabled={updateReservation.isPending}
                              >
                                <SelectTrigger className="w-32 bg-transparent border-white/10 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-white/10">
                                  <SelectItem value="pending">{t('common.pending', 'Pending')}</SelectItem>
                                  <SelectItem value="confirmed">{t('common.confirmed', 'Confirmed')}</SelectItem>
                                  <SelectItem value="completed">{t('common.completed', 'Completed')}</SelectItem>
                                  <SelectItem value="cancelled">{t('common.cancelled', 'Cancelled')}</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">{t('adminDashboard.noReservationsFound', 'No reservations found')}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-white">{t('adminDashboard.allOrders', 'All Orders')}</CardTitle>
                  <CardDescription>{t('adminDashboard.viewManageOrders', 'View and manage all platform orders')}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder={t('adminDashboard.searchOrders', 'Search orders...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64 bg-transparent border-white/10"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32 bg-transparent border-white/10">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-white/10">
                      <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
                      <SelectItem value="pending">{t('common.pending', 'Pending')}</SelectItem>
                      <SelectItem value="preparing">{t('common.preparing', 'Preparing')}</SelectItem>
                      <SelectItem value="ready">{t('common.ready', 'Ready')}</SelectItem>
                      <SelectItem value="served">{t('common.served', 'Served')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
              ) : filteredOrders && filteredOrders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-muted-foreground">{t('adminDashboard.orderId', 'Order ID')}</TableHead>
                      <TableHead className="text-muted-foreground">{t('adminDashboard.restaurant', 'Restaurant')}</TableHead>
                      <TableHead className="text-muted-foreground">{t('adminDashboard.customer', 'Customer')}</TableHead>
                      <TableHead className="text-muted-foreground">{t('adminDashboard.total', 'Total')}</TableHead>
                      <TableHead className="text-muted-foreground">{t('adminDashboard.status', 'Status')}</TableHead>
                      <TableHead className="text-right text-muted-foreground">{t('adminDashboard.actions', 'Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map(order => {
                      const restaurant = allRestaurants?.find(r => r.id === order.restaurantId);
                      return (
                        <TableRow key={order.id} className="border-white/5 hover:bg-white/5" data-testid={`row-order-${order.id}`}>
                          <TableCell className="font-mono text-primary">#{order.id.slice(-6)}</TableCell>
                          <TableCell className="text-white">{restaurant?.name || "Unknown"}</TableCell>
                          <TableCell className="text-muted-foreground">{order.customerName || "Guest"}</TableCell>
                          <TableCell className="text-white flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-emerald-500" />
                            {order.total} EGP
                          </TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-white/5"
                                onClick={() => setSelectedOrder(order)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Select 
                                value={order.status} 
                                onValueChange={(value) => handleOrderStatus(order.id, value)}
                                disabled={updateOrder.isPending}
                              >
                                <SelectTrigger className="w-32 bg-transparent border-white/10 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-white/10">
                                  <SelectItem value="pending">{t('common.pending', 'Pending')}</SelectItem>
                                  <SelectItem value="preparing">{t('common.preparing', 'Preparing')}</SelectItem>
                                  <SelectItem value="ready">{t('common.ready', 'Ready')}</SelectItem>
                                  <SelectItem value="served">{t('common.served', 'Served')}</SelectItem>
                                  <SelectItem value="cancelled">{t('common.cancelled', 'Cancelled')}</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">{t('adminDashboard.noOrdersFound', 'No orders found')}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card/50 border-white/5">
              <CardHeader>
                <CardTitle className="text-white">{t('adminDashboard.platformAnalytics', 'Platform Analytics')}</CardTitle>
                <CardDescription>{t('adminDashboard.detailedInsights', 'Detailed insights and performance metrics')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{t('adminDashboard.revenue', 'Revenue')}</span>
                      <span className="text-sm font-bold text-emerald-500">+23%</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">125,450 EGP</div>
                    <div className="w-full bg-white/5 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{t('adminDashboard.userGrowth', 'User Growth')}</span>
                      <span className="text-sm font-bold text-blue-500">+12%</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{stats?.users || 0} {t('adminDashboard.users', 'Users')}</div>
                    <div className="w-full bg-white/5 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{t('adminDashboard.restaurantGrowth', 'Restaurant Growth')}</span>
                      <span className="text-sm font-bold text-purple-500">+8%</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{stats?.restaurants || 0} {t('adminDashboard.restaurants', 'Restaurants')}</div>
                    <div className="w-full bg-white/5 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-white/5">
              <CardHeader>
                <CardTitle className="text-white">{t('adminDashboard.topRestaurants', 'Top Restaurants')}</CardTitle>
                <CardDescription>{t('adminDashboard.byRevenue', 'By Revenue')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allRestaurants?.slice(0, 5).map((restaurant, idx) => (
                    <div key={restaurant.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {idx + 1}
                      </div>
                      <img src={restaurant.image || ""} alt="" className="w-10 h-10 rounded-md object-cover border border-white/5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{restaurant.name}</p>
                        <p className="text-xs text-muted-foreground">{restaurant.cuisine}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-500">+{15 - idx * 2}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card/50 border-white/5 mt-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                {t('adminDashboard.recentActivity', 'Recent Activity')}
              </CardTitle>
              <CardDescription>{t('adminDashboard.platformUpdates', 'Platform Updates')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: 'user', text: 'New user registered: Ahmed Mohamed', time: '2 mins ago', icon: Users },
                  { type: 'restaurant', text: 'Restaurant approved: La Piazza', time: '15 mins ago', icon: Store },
                  { type: 'reservation', text: 'New reservation at Sequoia', time: '1 hour ago', icon: Calendar },
                  { type: 'order', text: 'Order completed: #A3F4D2', time: '2 hours ago', icon: ShoppingBag },
                  { type: 'user', text: 'User role updated: Sara to Owner', time: '3 hours ago', icon: Shield },
                ].map((activity, idx) => {
                  const Icon = activity.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white">{activity.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Logs Tab */}
        <TabsContent value="logs">
          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    {t('adminDashboard.systemActivityLogs', 'System Activity Logs')}
                  </CardTitle>
                  <CardDescription>{t('adminDashboard.trackAllActions', 'Track all platform actions and events')}</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="border-white/10">
                  <Download className="w-4 h-4 mr-2" />
                  {t('common.export', 'Export Logs')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
              ) : activityLogs && activityLogs.length > 0 ? (
                <div className="space-y-2">
                  {activityLogs.map((log: any) => {
                    const getActivityIcon = (type: string) => {
                      switch (type) {
                        case 'user_registered':
                        case 'user_updated':
                          return Users;
                        case 'user_deleted':
                          return Trash2;
                        case 'restaurant_created':
                        case 'restaurant_approved':
                          return Store;
                        case 'restaurant_suspended':
                          return Ban;
                        case 'reservation_created':
                        case 'reservation_updated':
                          return Calendar;
                        case 'order_created':
                        case 'order_updated':
                          return ShoppingBag;
                        case 'system_setting_changed':
                          return Settings;
                        default:
                          return Activity;
                      }
                    };

                    const getActivityColor = (type: string) => {
                      if (type.includes('deleted') || type.includes('suspended')) return 'text-rose-500 bg-rose-500/10';
                      if (type.includes('approved') || type.includes('created')) return 'text-emerald-500 bg-emerald-500/10';
                      if (type.includes('updated')) return 'text-blue-500 bg-blue-500/10';
                      return 'text-primary bg-primary/10';
                    };

                    const Icon = getActivityIcon(log.activityType);
                    
                    return (
                      <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors border border-white/5">
                        <div className={cn("p-2 rounded-lg", getActivityColor(log.activityType))}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white">{log.description}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-xs text-muted-foreground">
                              {log.createdAt ? new Date(log.createdAt).toLocaleString(isRTL ? 'ar-EG' : 'en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : "N/A"}
                            </p>
                            {log.ipAddress && (
                              <p className="text-xs text-muted-foreground">IP: {log.ipAddress}</p>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize text-xs border-white/10">
                          {log.activityType.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  {t('adminDashboard.noActivityLogs', 'No activity logs found')}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    {t('adminDashboard.systemNotifications', 'System Notifications')}
                  </CardTitle>
                  <CardDescription>{t('adminDashboard.manageAlerts', 'Manage platform alerts and announcements')}</CardDescription>
                </div>
                <Button className="bg-primary/20 text-primary border border-primary/50 hover:bg-primary/30">
                  <Bell className="w-4 h-4 mr-2" />
                  {t('adminDashboard.createNotification', 'Create Notification')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {notificationsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
              ) : notifications && notifications.length > 0 ? (
                <div className="space-y-2">
                  {notifications.map((notification: any) => {
                    const getNotificationIcon = (type: string) => {
                      switch (type) {
                        case 'success':
                          return CheckCircle;
                        case 'warning':
                          return AlertCircle;
                        case 'error':
                          return XCircle;
                        default:
                          return Info;
                      }
                    };

                    const getNotificationColor = (type: string) => {
                      switch (type) {
                        case 'success':
                          return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
                        case 'warning':
                          return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
                        case 'error':
                          return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
                        default:
                          return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
                      }
                    };

                    const Icon = getNotificationIcon(notification.type);
                    
                    return (
                      <div key={notification.id} className={cn(
                        "flex items-start gap-3 p-4 rounded-lg border transition-all",
                        notification.read ? "opacity-60 hover:bg-white/5" : "hover:bg-white/5 border-primary/20",
                        getNotificationColor(notification.type)
                      )}>
                        <div className="p-2 rounded-lg">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-white">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <p className="text-xs text-muted-foreground">
                              {notification.createdAt ? new Date(notification.createdAt).toLocaleString(isRTL ? 'ar-EG' : 'en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : "N/A"}
                            </p>
                            {notification.link && (
                              <a href={notification.link} className="text-xs text-primary hover:underline flex items-center gap-1">
                                <ExternalLink className="w-3 h-3" />
                                {t('common.viewDetails', 'View Details')}
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!notification.read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-white/10"
                              onClick={() => markNotificationRead.mutate(notification.id)}
                              disabled={markNotificationRead.isPending}
                              title={t('adminDashboard.markAsRead', 'Mark as read')}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-rose-500 hover:bg-rose-500/20"
                            onClick={() => deleteNotification.mutate(notification.id)}
                            disabled={deleteNotification.isPending}
                            title={t('common.delete', 'Delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BellOff className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-muted-foreground text-sm">{t('adminDashboard.noNotifications', 'No notifications found')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <DialogContent className="bg-card border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="font-heading">{t('adminDashboard.deleteUserTitle', 'Delete User')}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">{t('adminDashboard.deleteUserConfirm', 'Are you sure you want to delete this user? This action cannot be undone.')}</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">{t('common.cancel', 'Cancel')}</Button>
            </DialogClose>
            <Button 
              onClick={handleDeleteUser}
              className="bg-rose-500 text-white hover:bg-rose-600"
              disabled={deleteUser.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteUser.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t('common.delete', 'Delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="bg-card border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <UserCog className="w-5 h-5 text-primary" />
              {t('adminDashboard.userDetails', 'User Details')}
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-white/10">
                  <AvatarImage src={selectedUser.avatar || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {selectedUser.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  {getRoleBadge(selectedUser.role)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">{t('adminDashboard.email', 'Email')}</label>
                  <p className="text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    {selectedUser.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">{t('adminDashboard.role', 'Role')}</label>
                  <p className="text-white capitalize">{selectedUser.role.replace('_', ' ')}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">{t('adminDashboard.joined', 'Joined')}</label>
                  <p className="text-white">
                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="border-white/10" onClick={() => setSelectedUser(null)}>
              {t('adminDashboard.close', 'Close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restaurant Details Dialog */}
      <Dialog open={!!selectedRestaurant} onOpenChange={() => setSelectedRestaurant(null)}>
        <DialogContent className="bg-card border-white/10 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              {t('adminDashboard.restaurantDetails', 'Restaurant Details')}
            </DialogTitle>
          </DialogHeader>
          {selectedRestaurant && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <img src={selectedRestaurant.image || ""} alt="" className="w-24 h-24 rounded-lg object-cover border border-white/5" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">{selectedRestaurant.name}</h3>
                  <p className="text-muted-foreground mb-2">{selectedRestaurant.cuisine}</p>
                  {getStatusBadge(selectedRestaurant.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">{t('adminDashboard.location', 'Location')}</label>
                  <p className="text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    {selectedRestaurant.address}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">{t('adminDashboard.contact', 'Contact')}</label>
                  <p className="text-white flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    {selectedRestaurant.phone || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">{t('common.cuisine', 'Cuisine')}</label>
                  <p className="text-white">{selectedRestaurant.cuisine}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">{t('common.priceRange', 'Price Range')}</label>
                  <p className="text-white">{selectedRestaurant.priceRange || 'N/A'}</p>
                </div>
              </div>

              {selectedRestaurant.description && (
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">{t('common.description', 'Description')}</label>
                  <p className="text-white text-sm">{selectedRestaurant.description}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-white/5">
                {selectedRestaurant.status === "pending" && (
                  <>
                    <Button 
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                      onClick={() => handleApprove(selectedRestaurant.id, selectedRestaurant.name)}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {t('adminDashboard.approve', 'Approve')}
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1 border-rose-500 text-rose-500 hover:bg-rose-500/20"
                      onClick={() => handleReject(selectedRestaurant.id, selectedRestaurant.name)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      {t('adminDashboard.reject', 'Reject')}
                    </Button>
                  </>
                )}
                {selectedRestaurant.status === "active" && (
                  <Button 
                    variant="outline"
                    className="w-full border-amber-500 text-amber-500 hover:bg-amber-500/20"
                    onClick={() => handleReject(selectedRestaurant.id, selectedRestaurant.name)}
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    {t('adminDashboard.suspend', 'Suspend')}
                  </Button>
                )}
                {selectedRestaurant.status === "suspended" && (
                  <Button 
                    className="w-full bg-emerald-500 hover:bg-emerald-600"
                    onClick={() => handleApprove(selectedRestaurant.id, selectedRestaurant.name)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {t('adminDashboard.activate', 'Activate')}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
