import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./lib/auth";
import { Toaster } from "@/components/ui/toaster";
import "./lib/i18n";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Auth from "@/pages/auth";
import RestaurantList from "@/pages/restaurant-list";
import RestaurantDetail from "@/pages/restaurant-detail";
import About from "@/pages/about";
import UserProfile from "@/pages/user-profile";
import BookingConfirmation from "@/pages/booking-confirmation";
import RestaurantOnboarding from "@/pages/restaurant-onboarding";
import AdminDashboard from "@/pages/admin-dashboard";
import RestaurantDashboard from "@/pages/restaurant-dashboard";
import PlatformSettings from "@/pages/platform-settings";

// Wrapper component to handle default tab based on route
function AdminDashboardWrapper() {
  const [location] = useLocation();
  
  let defaultTab = "overview";
  if (location.includes("/admin/users")) defaultTab = "users";
  else if (location.includes("/admin/restaurants")) defaultTab = "restaurants";
  else if (location.includes("/admin/reservations")) defaultTab = "reservations";
  else if (location.includes("/admin/orders")) defaultTab = "orders";
  else if (location.includes("/admin/analytics")) defaultTab = "analytics";
  else if (location.includes("/admin/logs")) defaultTab = "logs";
  else if (location.includes("/admin/notifications")) defaultTab = "notifications";
  
  return <AdminDashboard defaultTab={defaultTab} />;
}

function Router() {
  return (
    <Switch>
      {/* Public / Customer Routes */}
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/restaurants" component={RestaurantList} />
      <Route path="/restaurants/:id" component={RestaurantDetail} />
      <Route path="/about" component={About} />
      <Route path="/profile" component={UserProfile} />
      <Route path="/booking-confirmation" component={BookingConfirmation} />
      <Route path="/onboarding" component={RestaurantOnboarding} />
      
      {/* Admin Routes - Both tab-based and separate routes */}
      <Route path="/admin" component={AdminDashboardWrapper} />
      <Route path="/admin/users" component={AdminDashboardWrapper} />
      <Route path="/admin/restaurants" component={AdminDashboardWrapper} />
      <Route path="/admin/reservations" component={AdminDashboardWrapper} />
      <Route path="/admin/orders" component={AdminDashboardWrapper} />
      <Route path="/admin/analytics" component={AdminDashboardWrapper} />
      <Route path="/admin/logs" component={AdminDashboardWrapper} />
      <Route path="/admin/notifications" component={AdminDashboardWrapper} />
      <Route path="/admin/settings" component={PlatformSettings} />
      
      {/* Restaurant Owner Routes */}
      <Route path="/dashboard" component={RestaurantDashboard} />
      <Route path="/dashboard/menu" component={RestaurantDashboard} />
      <Route path="/dashboard/orders" component={RestaurantDashboard} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster />
        <Router />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
