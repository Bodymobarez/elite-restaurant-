import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Auth from "@/pages/auth";
import RestaurantList from "@/pages/restaurant-list";
import AdminDashboard from "@/pages/admin-dashboard";
import RestaurantDashboard from "@/pages/restaurant-dashboard";
import RestaurantDetail from "@/pages/restaurant-detail";

function Router() {
  return (
    <Switch>
      {/* Public / Customer Routes */}
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/restaurants" component={RestaurantList} />
      <Route path="/restaurants/:id" component={RestaurantDetail} />
      
      {/* Admin Routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/restaurants" component={AdminDashboard} /> {/* Reuse for demo */}
      
      {/* Restaurant Owner Routes */}
      <Route path="/dashboard" component={RestaurantDashboard} />
      <Route path="/dashboard/menu" component={RestaurantDashboard} /> {/* Reuse for demo */}
      <Route path="/dashboard/orders" component={RestaurantDashboard} /> {/* Reuse for demo */}

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

export default App;
