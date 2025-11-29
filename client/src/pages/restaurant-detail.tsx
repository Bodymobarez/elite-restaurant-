import { useParams } from "wouter";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { restaurants, menuItems } from "@/lib/mockData";
import { Star, MapPin, Clock, Share2, Heart, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function RestaurantDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const restaurant = restaurants.find(r => r.id === id) || restaurants[0]; // Fallback for demo

  const handleAddToCart = (item: string) => {
    toast({
      title: "Added to Order",
      description: `${item} has been added to your cart.`,
    });
  };

  return (
    <CustomerLayout>
      {/* Hero Banner */}
      <div className="relative h-[50vh] min-h-[400px]">
        <img 
          src={restaurant.image} 
          alt={restaurant.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="outline" className="border-primary text-primary bg-primary/10 uppercase tracking-widest text-[10px]">Fine Dining</Badge>
                <div className="flex items-center gap-1 text-primary">
                  <Star className="w-4 h-4 fill-primary" />
                  <span className="font-medium">{restaurant.rating} (120+ Reviews)</span>
                </div>
              </div>
              <h1 className="font-heading text-4xl md:text-6xl text-white mb-4">{restaurant.name}</h1>
              <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm">
                <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {restaurant.location}</span>
                <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Open 5:00 PM - 11:00 PM</span>
                <span className="text-primary font-medium">{restaurant.priceRange}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" size="icon" className="rounded-full border-white/20 text-white hover:bg-white/10 hover:text-white">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full border-white/20 text-white hover:bg-white/10 hover:text-white">
                <Heart className="w-4 h-4" />
              </Button>
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8">
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
              {["Starters", "Mains", "Desserts", "Drinks"].map((category) => (
                <TabsTrigger 
                  key={category} 
                  value={category.toLowerCase()}
                  className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-0 py-2 text-lg font-heading text-muted-foreground hover:text-white transition-colors"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {["Starters", "Mains", "Desserts", "Drinks"].map((category) => (
            <TabsContent key={category} value={category.toLowerCase()} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.filter(item => item.category === category).map((item) => (
                  <div key={item.id} className="group bg-card/50 border border-white/5 rounded-xl overflow-hidden hover:border-primary/30 transition-colors">
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <Button 
                        size="icon" 
                        className="absolute bottom-3 right-3 rounded-full w-10 h-10 bg-white/10 backdrop-blur-md text-white hover:bg-primary hover:text-primary-foreground border border-white/20 transition-all"
                        onClick={() => handleAddToCart(item.name)}
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-heading text-lg text-white">{item.name}</h3>
                        <span className="font-medium text-primary">${item.price}</span>
                      </div>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        Exquisite preparation using the finest ingredients sourced locally and internationally.
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Add dummy items if category empty for demo */}
                {menuItems.filter(item => item.category === category).length === 0 && (
                  <div className="col-span-full py-12 text-center text-muted-foreground italic">
                    Seasonal menu items for this category are being updated.
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </CustomerLayout>
  );
}
