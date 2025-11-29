import { Switch, Route } from "wouter";
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
      
      {/* Admin Routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/restaurants" component={AdminDashboard} />
      
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
