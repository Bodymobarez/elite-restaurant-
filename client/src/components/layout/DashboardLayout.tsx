import { Link, useLocation } from "wouter";
import logo from "@assets/generated_images/minimalist_gold_luxury_logo_icon.png";
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ClipboardList, 
  Users, 
  Settings, 
  LogOut, 
  Menu as MenuIcon,
  ChefHat,
  Store
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";

export function DashboardLayout({ children, role = "admin" }: { children: React.ReactNode, role?: "admin" | "restaurant" }) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const adminLinks = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/restaurants", label: "Restaurants", icon: Store },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/settings", label: "Platform Settings", icon: Settings },
  ];

  const restaurantLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/menu", label: "Menu Management", icon: UtensilsCrossed },
    { href: "/dashboard/orders", label: "Live Orders", icon: ClipboardList },
    { href: "/dashboard/staff", label: "Staff", icon: ChefHat },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  const links = role === "admin" ? adminLinks : restaurantLinks;

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col fixed h-full z-30 hidden md:flex">
        <div className="p-6 border-b border-sidebar-border flex items-center gap-3">
          <img src={logo} alt="Elite Hub" className="w-8 h-8 rounded-full" />
          <div>
            <h1 className="font-heading text-lg font-medium tracking-tight text-sidebar-primary-foreground">Elite<span className="text-sidebar-primary">Hub</span></h1>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              {role === "admin" ? "Admin Console" : "Partner Portal"}
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href;
            return (
              <Link key={link.href} href={link.href} className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 group cursor-pointer",
                isActive 
                  ? "bg-sidebar-primary/10 text-sidebar-primary border border-sidebar-primary/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]" 
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )} data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}>
                <Icon className={cn("w-4 h-4", isActive ? "text-sidebar-primary" : "text-muted-foreground group-hover:text-sidebar-foreground")} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
           <div className="flex items-center gap-3 px-2 mb-4">
             <Avatar className="h-9 w-9 border border-white/10">
               <AvatarImage src={user?.avatar || undefined} />
               <AvatarFallback className="bg-primary/10 text-primary text-xs">
                 {user?.name?.slice(0, 2).toUpperCase() || "U"}
               </AvatarFallback>
             </Avatar>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-medium truncate text-sidebar-foreground">{user?.name || "User"}</p>
               <p className="text-xs text-muted-foreground truncate capitalize">{role}</p>
             </div>
           </div>
           <Button 
             variant="outline" 
             className="w-full justify-start gap-2 border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-colors text-muted-foreground"
             onClick={handleLogout}
             data-testid="button-signout"
           >
              <LogOut className="w-4 h-4" />
              Sign Out
           </Button>
        </div>
      </aside>

      {/* Mobile Header Placeholder (Simplified) */}
      <div className="md:hidden fixed top-0 w-full bg-sidebar border-b border-sidebar-border p-4 z-40 flex justify-between items-center">
         <span className="font-heading font-medium">EliteHub</span>
         <Button variant="ghost" size="icon"><MenuIcon className="w-5 h-5" /></Button>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen bg-background/50 relative">
        {/* Background texture/glow */}
        <div className="absolute inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
        
        <div className="p-6 md:p-8 mt-16 md:mt-0 max-w-7xl mx-auto animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
