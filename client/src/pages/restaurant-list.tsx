import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { useRestaurants, useGovernorates, useDistricts } from "@/lib/api";
import { Link } from "wouter";
import { Star, MapPin, Search, Filter, Loader2, Building2, Navigation, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function RestaurantList() {
  const [selectedGovernorate, setSelectedGovernorate] = useState<string | undefined>();
  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: governorates } = useGovernorates();
  const { data: districts } = useDistricts(selectedGovernorate);
  const { data: restaurants, isLoading } = useRestaurants(selectedGovernorate, selectedDistrict);
  
  const handleGovernorateChange = (value: string) => {
    setSelectedGovernorate(value);
    setSelectedDistrict(undefined);
  };
  
  const clearFilters = () => {
    setSelectedGovernorate(undefined);
    setSelectedDistrict(undefined);
    setSearchQuery("");
  };
  
  const selectedGovName = governorates?.find(g => g.id === selectedGovernorate)?.name;
  const selectedDistrictName = districts?.find(d => d.id === selectedDistrict)?.name;

  const filteredRestaurants = restaurants?.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <CustomerLayout>
      <div className="pt-32 pb-12 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col gap-8 mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="font-heading text-4xl md:text-5xl text-white mb-4">
                {selectedDistrictName ? (
                  <>Restaurants in <span className="text-primary">{selectedDistrictName}</span></>
                ) : selectedGovName ? (
                  <>Restaurants in <span className="text-primary">{selectedGovName}</span></>
                ) : (
                  <>All Restaurants</>
                )}
              </h1>
              <p className="text-muted-foreground text-lg">
                Explore Egypt's finest dining establishments - مطاعم النخبة في مصر
              </p>
            </div>
          </div>
          
          {/* Location Filters */}
          <div className="flex flex-wrap gap-4 items-center bg-card/30 border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <Select value={selectedGovernorate} onValueChange={handleGovernorateChange}>
                <SelectTrigger 
                  className="w-[180px] bg-background/50 border-white/10"
                  data-testid="select-governorate"
                >
                  <SelectValue placeholder="Governorate" />
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-md border-white/10">
                  {governorates?.map((gov) => (
                    <SelectItem key={gov.id} value={gov.id}>
                      {gov.name} - {gov.nameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-primary" />
              <Select 
                value={selectedDistrict} 
                onValueChange={setSelectedDistrict}
                disabled={!selectedGovernorate}
              >
                <SelectTrigger 
                  className="w-[180px] bg-background/50 border-white/10 disabled:opacity-50"
                  data-testid="select-district"
                >
                  <SelectValue placeholder="District" />
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-md border-white/10">
                  {districts?.map((district) => (
                    <SelectItem key={district.id} value={district.id}>
                      {district.name} - {district.nameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search by name or cuisine..." 
                className="pl-10 bg-background/50 border-white/10 text-white focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-restaurants"
              />
            </div>
            
            {(selectedGovernorate || selectedDistrict || searchQuery) && (
              <Button 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground hover:text-white gap-2"
                onClick={clearFilters}
                data-testid="button-clear-filters"
              >
                <X className="w-4 h-4" /> Clear
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : filteredRestaurants && filteredRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRestaurants.map((restaurant, idx) => (
              <Link key={restaurant.id} href={`/restaurants/${restaurant.id}`}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group cursor-pointer bg-card/30 border border-white/5 rounded-xl overflow-hidden hover:border-primary/30 transition-all hover:shadow-[0_0_30px_rgba(212,175,55,0.1)]"
                  data-testid={`card-restaurant-${restaurant.id}`}
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img 
                      src={restaurant.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"} 
                      alt={restaurant.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 border border-white/10">
                      <Star className="w-3 h-3 text-primary fill-primary" />
                      <span className="text-xs font-medium text-white">{restaurant.rating || "4.5"}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-heading text-xl text-white group-hover:text-primary transition-colors">{restaurant.name}</h3>
                      <span className="text-sm font-medium text-primary">{restaurant.priceRange}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span>{restaurant.cuisine}</span>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {restaurant.address?.split(",")[0] || "Downtown"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-white/10 text-muted-foreground text-[10px]">Valet Parking</Badge>
                      <Badge variant="outline" className="border-white/10 text-muted-foreground text-[10px]">Private Room</Badge>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p>{searchQuery ? "No restaurants match your search." : "No restaurants available yet."}</p>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
