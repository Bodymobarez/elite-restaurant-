import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { useRestaurants, useGovernorates, useDistricts } from "@/lib/api";
import { Link } from "wouter";
import { Star, MapPin, Search, Loader2, Building2, Navigation, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function RestaurantList() {
  const [selectedGovernorate, setSelectedGovernorate] = useState<string | undefined>();
  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  
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
  
  const selectedGov = governorates?.find(g => g.id === selectedGovernorate);
  const selectedDist = districts?.find(d => d.id === selectedDistrict);
  const selectedGovName = selectedGov ? (isArabic ? selectedGov.nameAr : selectedGov.name) : null;
  const selectedDistrictName = selectedDist ? (isArabic ? selectedDist.nameAr : selectedDist.name) : null;

  const getGovernorateName = (gov: any) => isArabic ? gov.nameAr : gov.name;
  const getDistrictName = (district: any) => isArabic ? district.nameAr : district.name;

  const filteredRestaurants = restaurants?.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <CustomerLayout>
      <div className="pt-32 pb-12 px-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col gap-8 mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="font-heading text-5xl md:text-6xl text-white mb-4 tracking-tight">
                {selectedDistrictName ? (
                  <>{t('restaurants.title')} <span className="text-primary">{selectedDistrictName}</span></>
                ) : selectedGovName ? (
                  <>{t('restaurants.title')} <span className="text-primary">{selectedGovName}</span></>
                ) : (
                  <>{t('restaurants.title')}</>
                )}
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {t('restaurants.subtitle')}
              </p>
            </div>
          </div>
          
          {/* Location Filters */}
          <div className="flex flex-wrap gap-4 items-center bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 shadow-lg shadow-primary/5 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <Select value={selectedGovernorate} onValueChange={handleGovernorateChange}>
                <SelectTrigger 
                  className="w-[180px] bg-background/50 border-white/10"
                  data-testid="select-governorate"
                >
                  <SelectValue placeholder={t('home.selectGovernorate')} />
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-md border-white/10">
                  {governorates?.map((gov) => (
                    <SelectItem key={gov.id} value={gov.id}>
                      {getGovernorateName(gov)}
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
                  <SelectValue placeholder={t('home.selectDistrict')} />
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-md border-white/10">
                  {districts?.map((district) => (
                    <SelectItem key={district.id} value={district.id}>
                      {getDistrictName(district)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder={t('restaurants.searchPlaceholder')}
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
                className="text-muted-foreground hover:text-white hover:bg-white/10 gap-2 transition-all"
                onClick={clearFilters}
                data-testid="button-clear-filters"
              >
                <X className="w-4 h-4" /> {t('common.clearFilters')}
              </Button>
            )}
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : filteredRestaurants && filteredRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRestaurants.map((restaurant, idx) => (
              <Link key={restaurant.id} href={`/restaurants/${restaurant.id}`}>
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.5 }}
                  className="group cursor-pointer h-full bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(212,175,55,0.15)]"
                  data-testid={`card-restaurant-${restaurant.id}`}
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img 
                      src={restaurant.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"} 
                      alt={restaurant.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-primary/30">
                      <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                      <span className="text-xs font-semibold text-white">{restaurant.rating || "4.5"}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <h3 className="font-heading text-xl text-white group-hover:text-primary transition-colors line-clamp-2">{restaurant.name}</h3>
                      <span className="text-sm font-medium text-primary whitespace-nowrap">{restaurant.priceRange}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="font-medium">{restaurant.cuisine}</span>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <div className="flex items-center gap-1 min-w-0">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{restaurant.address?.split(",")[0] || "Downtown"}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p>{t('restaurants.noResults')}</p>
            <p className="text-sm mt-2">{t('restaurants.adjustFilters')}</p>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
