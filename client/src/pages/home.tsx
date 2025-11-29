import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroBg from "@assets/generated_images/atmospheric_dark_fine_dining_restaurant_interior.png";
import { useRestaurants } from "@/lib/api";
import { Link } from "wouter";
import { ArrowRight, Star, MapPin, Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: restaurants, isLoading } = useRestaurants();

  return (
    <CustomerLayout>
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBg} 
            alt="Fine Dining" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/30" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-medium text-white mb-6 tracking-tight leading-tight">
              Taste the <span className="text-primary italic">Extraordinary</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              Discover the city's most exclusive culinary destinations. Reserve your table at top-rated restaurants with just a tap.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto w-full">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Search for cuisine or restaurant..." 
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pl-10 h-12 rounded-full backdrop-blur-md focus-visible:ring-primary/50 focus-visible:border-primary"
                  data-testid="input-search"
                />
              </div>
              <Link href="/restaurants">
                <Button size="lg" className="rounded-full h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-medium" data-testid="button-explore">
                  Explore
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl text-white mb-2">Curated Selections</h2>
              <p className="text-muted-foreground">Hand-picked by our culinary experts.</p>
            </div>
            <Link href="/restaurants">
              <Button variant="link" className="text-primary hover:text-primary/80 p-0 gap-2" data-testid="link-view-all">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : restaurants && restaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {restaurants.slice(0, 6).map((restaurant, idx) => (
                <Link key={restaurant.id} href={`/restaurants/${restaurant.id}`}>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="group cursor-pointer"
                    data-testid={`card-restaurant-${restaurant.id}`}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl mb-4">
                      <img 
                        src={restaurant.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"} 
                        alt={restaurant.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 border border-white/10">
                        <Star className="w-3 h-3 text-primary fill-primary" />
                        <span className="text-xs font-medium text-white">{restaurant.rating || "4.5"}</span>
                      </div>
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />
                    </div>
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-heading text-xl text-white group-hover:text-primary transition-colors">{restaurant.name}</h3>
                        <span className="text-sm text-white/60">{restaurant.priceRange}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{restaurant.cuisine}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {restaurant.address?.split(",")[0] || "Downtown"}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <p>No restaurants available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-card/30 border-y border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-5xl text-white mb-6">Are you a Restaurant Owner?</h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join Elite Hub to showcase your culinary artistry to the world's most discerning diners. Manage reservations, menus, and analytics in one sophisticated platform.
          </p>
          <div className="flex justify-center gap-4">
             <Link href="/auth?role=restaurant">
              <Button size="lg" variant="outline" className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground" data-testid="button-partner">
                Partner With Us
              </Button>
             </Link>
          </div>
        </div>
      </section>
    </CustomerLayout>
  );
}
