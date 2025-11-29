import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import logo from "@assets/generated_images/minimalist_gold_luxury_logo_icon.png";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function CustomerLayout({ children }: { children: React.ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [location, setLocation] = useLocation();
  const isHome = location === "/";
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const getDashboardLink = () => {
    if (user?.role === "admin") return "/admin";
    if (user?.role === "restaurant_owner") return "/dashboard";
    return "/profile";
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <nav
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent px-6 py-4",
          (isScrolled || !isHome) 
            ? "bg-background/80 backdrop-blur-md border-white/10 py-3" 
            : "bg-transparent py-6"
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <img src={logo} alt="Elite Hub" className="w-10 h-10 rounded-full border border-primary/20 group-hover:border-primary/60 transition-colors" />
            <span className="font-heading text-2xl font-medium tracking-tight text-white">Elite<span className="text-primary">Hub</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors text-white/90 cursor-pointer">Home</Link>
            <Link href="/restaurants" className="text-sm font-medium hover:text-primary transition-colors text-white/90 cursor-pointer">Restaurants</Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors text-white/90 cursor-pointer">Our Story</Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 hover:bg-white/10" data-testid="button-user-menu">
                    <Avatar className="h-8 w-8 border border-primary/20">
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-white text-sm hidden md:inline">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-white/10 w-48">
                  <DropdownMenuItem onClick={() => setLocation(getDashboardLink())} className="cursor-pointer" data-testid="menu-dashboard">
                    {user.role === "admin" ? "Admin Dashboard" : user.role === "restaurant_owner" ? "Restaurant Dashboard" : "My Profile"}
                  </DropdownMenuItem>
                  {user.role === "customer" && (
                    <DropdownMenuItem onClick={() => setLocation("/profile")} className="cursor-pointer" data-testid="menu-reservations">
                      My Reservations
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="text-rose-400 cursor-pointer" data-testid="menu-logout">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="ghost" size="sm" className="text-white hover:text-primary hover:bg-white/5 hidden md:flex" data-testid="button-login">
                    Log In
                  </Button>
                </Link>
                <Link href="/auth?mode=signup">
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium" data-testid="button-signup">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-card border-t border-white/5 pt-16 pb-8 px-6 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
             <div className="flex items-center gap-2">
              <img src={logo} alt="Elite Hub" className="w-8 h-8 rounded-full" />
              <span className="font-heading text-xl text-white">Elite<span className="text-primary">Hub</span></span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Curating the world's finest dining experiences for the most discerning palates.
            </p>
          </div>
          
          <div>
            <h4 className="font-heading text-white mb-4">Discover</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/restaurants" className="hover:text-primary transition-colors cursor-pointer">New Arrivals</Link></li>
              <li><Link href="/restaurants" className="hover:text-primary transition-colors cursor-pointer">Michelin Starred</Link></li>
              <li><Link href="/restaurants" className="hover:text-primary transition-colors cursor-pointer">Private Dining</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors cursor-pointer">About Us</Link></li>
              <li><span className="hover:text-primary transition-colors cursor-pointer">Careers</span></li>
              <li><span className="hover:text-primary transition-colors cursor-pointer">Contact</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-white mb-4">For Restaurants</h4>
            <Link href="/auth">
              <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5 hover:text-primary hover:border-primary/50">
                Partner Access
              </Button>
            </Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>&copy; 2025 Elite Hub. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
