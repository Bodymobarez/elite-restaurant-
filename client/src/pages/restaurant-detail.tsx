import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRestaurant, useMenu, useFavorites, useToggleFavorite } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatEGP } from "@/lib/currency";
import { Star, MapPin, Clock, Share2, Heart, Plus, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BookingModal } from "@/components/BookingModal";

export default function RestaurantDetail() {
  const { id } = useParams();
  const [bookingOpen, setBookingOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { data: restaurant, isLoading: restaurantLoading } = useRestaurant(id || "");
  const { data: menuItems, isLoading: menuLoading } = useMenu(id || "");
  const { data: favorites } = useFavorites();
  const toggleFavorite = useToggleFavorite();

  const isFavorited = favorites?.some(f => f.restaurantId === id) || false;

  const handleAddToCart = (item: string) => {
    toast({
      title: "Added to Order",
      description: `${item} has been added to your cart.`,
    });
  };

  const handleFavorite = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Please sign in",
        description: "You need to be logged in to save favorites.",
      });
      return;
    }

    try {
      await toggleFavorite.mutateAsync({ restaurantId: id!, isFavorite: isFavorited });
      toast({
        title: isFavorited ? "Removed from Favorites" : "Added to Favorites",
        description: `${restaurant?.name} has been ${isFavorited ? "removed from" : "added to"} your favorites.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update favorites. Please try again.",
      });
    }
  };

  if (restaurantLoading) {
    return (
      <CustomerLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </CustomerLayout>
    );
  }

  if (!restaurant) {
    return (
      <CustomerLayout>
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-muted-foreground">Restaurant not found</p>
        </div>
      </CustomerLayout>
    );
  }

  const categories = ["Starters", "Mains", "Desserts", "Drinks"];

  return (
    <CustomerLayout>
      {/* Hero Banner */}
      <div className="relative h-[50vh] min-h-[400px]">
        <img 
          src={restaurant.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"} 
          alt={restaurant.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="outline" className="border-primary text-primary bg-primary/10 uppercase tracking-widest text-[10px]">Fine Dining</Badge>
                <div className="flex items-center gap-1 text-primary">
                  <Star className="w-4 h-4 fill-primary" />
                  <span className="font-medium">{restaurant.rating || "4.5"} (120+ Reviews)</span>
                </div>
              </div>
              <h1 className="font-heading text-4xl md:text-6xl text-white mb-4" data-testid="text-restaurant-name">{restaurant.name}</h1>
              <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm">
                <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {restaurant.address}</span>
                <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Open {restaurant.openTime} - {restaurant.closeTime}</span>
                <span className="text-primary font-medium">{restaurant.priceRange}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full border-white/20 text-white hover:bg-white/10 hover:text-white"
                data-testid="button-share"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className={`rounded-full border-white/20 text-white hover:bg-white/10 hover:text-white ${isFavorited ? 'bg-primary/20 border-primary/50' : ''}`}
                onClick={handleFavorite}
                disabled={toggleFavorite.isPending}
                data-testid="button-favorite"
              >
                <Heart className={`w-4 h-4 ${isFavorited ? "fill-primary text-primary" : ""}`} />
              </Button>
              <Button 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8"
                onClick={() => setBookingOpen(true)}
                data-testid="button-book"
              >
                Book a Table
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Tabs defaultValue="mains" className="w-full">
          <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
            <TabsList className="bg-transparent p-0 gap-8 h-auto">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category} 
                  value={category.toLowerCase()}
                  className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-0 py-2 text-lg font-heading text-muted-foreground hover:text-white transition-colors"
                  data-testid={`tab-menu-${category.toLowerCase()}`}
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {menuLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : (
            categories.map((category) => (
              <TabsContent key={category} value={category.toLowerCase()} className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {menuItems?.filter(item => item.category === category).map((item) => (
                    <div key={item.id} className="group bg-card/50 border border-white/5 rounded-xl overflow-hidden hover:border-primary/30 transition-colors" data-testid={`card-menu-item-${item.id}`}>
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <img 
                          src={item.image || "https://images.unsplash.com/photo-1476124369491-e7addf5db371?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"} 
                          alt={item.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <Button 
                          size="icon" 
                          className="absolute bottom-3 right-3 rounded-full w-10 h-10 bg-white/10 backdrop-blur-md text-white hover:bg-primary hover:text-primary-foreground border border-white/20 transition-all"
                          onClick={() => handleAddToCart(item.name)}
                          data-testid={`button-add-${item.id}`}
                        >
                          <Plus className="w-5 h-5" />
                        </Button>
                      </div>
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-heading text-lg text-white">{item.name}</h3>
                          <span className="font-medium text-primary">{formatEGP(item.price)}</span>
                        </div>
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {item.description || "Exquisite preparation using the finest ingredients sourced locally and internationally."}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {(!menuItems || menuItems.filter(item => item.category === category).length === 0) && (
                    <div className="col-span-full py-12 text-center text-muted-foreground italic">
                      Seasonal menu items for this category are being updated.
                    </div>
                  )}
                </div>
              </TabsContent>
            ))
          )}
        </Tabs>
      </div>

      <BookingModal 
        open={bookingOpen} 
        onOpenChange={setBookingOpen}
        restaurantName={restaurant.name}
        restaurantId={restaurant.id}
      />
    </CustomerLayout>
  );
}
