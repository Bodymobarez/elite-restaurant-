import { useState } from "react";
import { Link } from "wouter";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, Heart, Clock, Loader2, MapPin, User, Mail, Phone, 
  Lock, Save, X, Edit, Settings, Shield, Bell, Globe, Moon, Sun 
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useReservations, useFavorites, useRestaurants, useToggleFavorite, useUpdateProfile, useChangePassword } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Switch } from "@/components/ui/switch";

export default function UserProfile() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: ""
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    darkMode: false,
    language: i18n.language
  });
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { data: reservations, isLoading: reservationsLoading } = useReservations(user?.id);
  const { data: favorites, isLoading: favoritesLoading } = useFavorites();
  const { data: restaurants } = useRestaurants();
  const toggleFavorite = useToggleFavorite();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const favoriteRestaurants = restaurants?.filter(r => 
    favorites?.some(f => f.restaurantId === r.id)
  ) || [];

  const upcomingReservations = reservations?.filter(r => 
    r.status === "confirmed" || r.status === "pending"
  ) || [];

  const pastReservations = reservations?.filter(r => 
    r.status === "completed" || r.status === "cancelled"
  ) || [];

  // Initialize profile data when user loads
  useState(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || ""
      });
    }
  });

  const handleSaveProfile = async () => {
    try {
      await updateProfile.mutateAsync(profileData);
      toast({
        title: t('profile.profileUpdated', 'Profile Updated'),
        description: t('profile.profileUpdatedDesc', 'Your profile has been updated successfully.'),
      });
      setIsEditing(false);
    } catch {
      toast({
        variant: "destructive",
        title: t('common.error', 'Error'),
        description: t('profile.updateFailed', 'Failed to update profile'),
      });
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        variant: "destructive",
        title: t('common.error', 'Error'),
        description: t('profile.passwordsMismatch', 'Passwords do not match'),
      });
      return;
    }

    try {
      await changePassword.mutateAsync({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast({
        title: t('profile.passwordChanged', 'Password Changed'),
        description: t('profile.passwordChangedDesc', 'Your password has been changed successfully.'),
      });
      setShowPasswordDialog(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t('common.error', 'Error'),
        description: error.message || t('profile.passwordChangeFailed', 'Failed to change password'),
      });
    }
  };

  const handleSaveSettings = () => {
    i18n.changeLanguage(settings.language);
    toast({
      title: t('profile.settingsSaved', 'Settings Saved'),
      description: t('profile.settingsSavedDesc', 'Your settings have been saved successfully.'),
    });
    setShowSettingsDialog(false);
  };

  const handleRemoveFavorite = async (restaurantId: string, restaurantName: string) => {
    try {
      await toggleFavorite.mutateAsync({ restaurantId, isFavorite: true });
      toast({
        title: "Removed from Favorites",
        description: `${restaurantName} has been removed from your favorites.`,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove from favorites",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">Confirmed</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">Pending</Badge>;
      case "completed":
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/50">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/50">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!user) {
    return (
      <CustomerLayout>
        <div className="pt-32 pb-20 px-6 text-center">
          <h2 className="font-heading text-2xl text-white mb-4">Please Sign In</h2>
          <p className="text-muted-foreground mb-6">You need to be logged in to view your profile.</p>
          <Link href="/auth">
            <Button className="bg-primary text-primary-foreground">Sign In</Button>
          </Link>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="bg-card/50 border-white/5 backdrop-blur-sm mb-8">
            <CardContent className="pt-8">
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
                <Avatar className="w-24 h-24 border-2 border-primary">
                  <AvatarImage src={user.avatar || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h1 className="font-heading text-3xl text-white mb-2" data-testid="text-user-name">{user.name}</h1>
                  <p className="text-muted-foreground mb-4">{user.email}</p>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 capitalize">{user.role.replace("_", " ")}</Badge>
                </div>

                <Button 
                  onClick={() => setIsEditing(!isEditing)}
                  className={isEditing ? "bg-primary/20 text-primary hover:bg-primary/30" : "bg-primary text-primary-foreground hover:bg-primary/90"}
                  data-testid="button-edit-profile"
                >
                  {isEditing ? "Done" : "Edit Profile"}
                </Button>
              </div>

              {isEditing && (
                <div className="mt-8 pt-8 border-t border-white/5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <Label className="text-white/80">{t('profile.name', 'Name')}</Label>
                      <Input 
                        value={profileData.name} 
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="bg-background/50 border-white/10 text-white mt-2" 
                        data-testid="input-name" 
                      />
                    </div>
                    <div>
                      <Label className="text-white/80">{t('profile.email', 'Email')}</Label>
                      <Input 
                        value={profileData.email} 
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="bg-background/50 border-white/10 text-white mt-2" 
                        data-testid="input-email" 
                      />
                    </div>
                    <div>
                      <Label className="text-white/80">{t('profile.phone', 'Phone')}</Label>
                      <Input 
                        value={profileData.phone} 
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567" 
                        className="bg-background/50 border-white/10 text-white mt-2" 
                        data-testid="input-phone" 
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={updateProfile.isPending}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {updateProfile.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('common.saving', 'Saving...')}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {t('common.saveChanges', 'Save Changes')}
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      onClick={() => {
                        setIsEditing(false);
                        setProfileData({ name: user.name, email: user.email, phone: user.phone || "" });
                      }}
                      variant="outline"
                      className="border-white/10 text-white hover:bg-white/5"
                    >
                      <X className="w-4 h-4 mr-2" />
                      {t('common.cancel', 'Cancel')}
                    </Button>
                    
                    <Button 
                      onClick={() => setShowPasswordDialog(true)}
                      variant="outline"
                      className="border-white/10 text-white hover:bg-white/5"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      {t('profile.changePassword', 'Change Password')}
                    </Button>
                    
                    <Button 
                      onClick={() => setShowSettingsDialog(true)}
                      variant="outline"
                      className="border-white/10 text-white hover:bg-white/5"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      {t('profile.settings', 'Settings')}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="reservations" className="space-y-6">
            <TabsList className="bg-card/50 border border-white/5">
              <TabsTrigger value="reservations" data-testid="tab-reservations">Upcoming Reservations</TabsTrigger>
              <TabsTrigger value="favorites" data-testid="tab-favorites">Favorites</TabsTrigger>
              <TabsTrigger value="history" data-testid="tab-history">Dining History</TabsTrigger>
            </TabsList>

            {/* Upcoming Reservations */}
            <TabsContent value="reservations">
              {reservationsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : upcomingReservations.length > 0 ? (
                <div className="space-y-4">
                  {upcomingReservations.map(res => {
                    const restaurant = restaurants?.find(r => r.id === res.restaurantId);
                    return (
                      <Card key={res.id} className="bg-card/50 border-white/5 backdrop-blur-sm hover:border-primary/30 transition-colors" data-testid={`card-reservation-${res.id}`}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-heading text-lg text-white mb-2">{restaurant?.name || "Restaurant"}</h3>
                              <div className="space-y-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" /> {new Date(res.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" /> {res.time} • {res.partySize} guests
                                </div>
                                {res.specialRequests && (
                                  <p className="text-xs italic mt-2">Note: {res.specialRequests}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                              {getStatusBadge(res.status)}
                              <Link href={`/restaurants/${res.restaurantId}`}>
                                <Button size="sm" variant="outline" className="border-white/10 text-white hover:bg-white/5">
                                  View Restaurant
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="bg-card/50 border-white/5">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground mb-4">No upcoming reservations</p>
                    <Link href="/restaurants">
                      <Button className="bg-primary text-primary-foreground">Browse Restaurants</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Favorites */}
            <TabsContent value="favorites">
              {favoritesLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : favoriteRestaurants.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {favoriteRestaurants.map(restaurant => (
                    <Card key={restaurant.id} className="bg-card/50 border-white/5 backdrop-blur-sm" data-testid={`card-favorite-${restaurant.id}`}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-heading text-lg text-white">{restaurant.name}</h3>
                            <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
                          </div>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="text-primary hover:text-rose-400"
                            onClick={() => handleRemoveFavorite(restaurant.id, restaurant.name)}
                            disabled={toggleFavorite.isPending}
                            data-testid={`button-remove-favorite-${restaurant.id}`}
                          >
                            <Heart className="w-5 h-5 fill-primary" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                          <MapPin className="w-4 h-4" />
                          {restaurant.address?.split(",")[0] || "View details"}
                        </div>
                        <Link href={`/restaurants/${restaurant.id}`}>
                          <Button size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                            Book a Table
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-card/50 border-white/5">
                  <CardContent className="py-12 text-center">
                    <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No favorites yet</p>
                    <Link href="/restaurants">
                      <Button className="bg-primary text-primary-foreground">Explore Restaurants</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Dining History */}
            <TabsContent value="history">
              {reservationsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : pastReservations.length > 0 ? (
                <div className="space-y-4">
                  {pastReservations.map(res => {
                    const restaurant = restaurants?.find(r => r.id === res.restaurantId);
                    return (
                      <Card key={res.id} className="bg-card/50 border-white/5" data-testid={`card-history-${res.id}`}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-heading text-lg text-white mb-1">{restaurant?.name || "Restaurant"}</h3>
                              <p className="text-sm text-muted-foreground">
                                {new Date(res.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} • {res.partySize} guests
                              </p>
                            </div>
                            {getStatusBadge(res.status)}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="bg-card/50 border-white/5">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No dining history yet</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="bg-card border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              {t('profile.changePassword', 'Change Password')}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t('profile.changePasswordDesc', 'Enter your current password and choose a new one')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="currentPassword" className="text-white/80">
                {t('profile.currentPassword', 'Current Password')}
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="bg-background/50 border-white/10 text-white mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="newPassword" className="text-white/80">
                {t('profile.newPassword', 'New Password')}
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="bg-background/50 border-white/10 text-white mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="confirmPassword" className="text-white/80">
                {t('profile.confirmPassword', 'Confirm New Password')}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="bg-background/50 border-white/10 text-white mt-2"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false);
                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
              }}
              className="border-white/10 text-white hover:bg-white/5"
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={changePassword.isPending || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {changePassword.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('common.changing', 'Changing...')}
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  {t('profile.changePassword', 'Change Password')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="bg-card border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              {t('profile.settings', 'Settings')}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t('profile.settingsDesc', 'Manage your preferences and notifications')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Notifications Section */}
            <div>
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                {t('profile.notifications', 'Notifications')}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailNotif" className="text-white/80 cursor-pointer">
                    {t('profile.emailNotifications', 'Email Notifications')}
                  </Label>
                  <Switch
                    id="emailNotif"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="smsNotif" className="text-white/80 cursor-pointer">
                    {t('profile.smsNotifications', 'SMS Notifications')}
                  </Label>
                  <Switch
                    id="smsNotif"
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Language Section */}
            <div>
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {t('profile.language', 'Language')}
              </h3>
              <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value as 'en' | 'ar' })}
                className="w-full bg-background/50 border border-white/10 text-white rounded-md px-3 py-2"
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>

            {/* Theme Section */}
            <div>
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Moon className="w-4 h-4" />
                {t('profile.theme', 'Theme')}
              </h3>
              <div className="flex items-center justify-between">
                <Label htmlFor="darkMode" className="text-white/80 cursor-pointer">
                  {t('profile.darkMode', 'Dark Mode')}
                </Label>
                <Switch
                  id="darkMode"
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, darkMode: checked })}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSettingsDialog(false)}
              className="border-white/10 text-white hover:bg-white/5"
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleSaveSettings}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Save className="w-4 h-4 mr-2" />
              {t('common.saveChanges', 'Save Changes')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CustomerLayout>
  );
}
