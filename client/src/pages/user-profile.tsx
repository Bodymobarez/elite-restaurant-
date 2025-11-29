import { useState } from "react";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Heart, Clock, Mail, Phone } from "lucide-react";

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);

  const upcomingReservations = [
    {
      id: "RES-001",
      restaurant: "Lumière",
      date: "December 20, 2025",
      time: "7:30 PM",
      party: "4 guests",
      status: "Confirmed"
    },
    {
      id: "RES-002",
      restaurant: "Sakura Zen",
      date: "January 5, 2026",
      time: "6:00 PM",
      party: "2 guests",
      status: "Confirmed"
    }
  ];

  const favorites = [
    { id: 1, name: "Lumière", cuisine: "French Fine Dining", rating: 4.9 },
    { id: 2, name: "Sakura Zen", cuisine: "Modern Japanese", rating: 4.8 },
    { id: 3, name: "The Obsidian Steakhouse", cuisine: "Steakhouse", rating: 4.7 }
  ];

  const pastReservations = [
    { id: "RES-100", restaurant: "Lumière", date: "November 10, 2025", rating: 5 },
    { id: "RES-101", restaurant: "Sakura Zen", date: "October 28, 2025", rating: 4 }
  ];

  return (
    <CustomerLayout>
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="bg-card/50 border-white/5 backdrop-blur-sm mb-8">
            <CardContent className="pt-8">
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
                <Avatar className="w-24 h-24 border-2 border-primary">
                  <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h1 className="font-heading text-3xl text-white mb-2">Jordan Davis</h1>
                  <p className="text-muted-foreground mb-4">Member since 2023</p>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">Elite Member</Badge>
                </div>

                <Button 
                  onClick={() => setIsEditing(!isEditing)}
                  className={isEditing ? "bg-primary/20 text-primary hover:bg-primary/30" : "bg-primary text-primary-foreground hover:bg-primary/90"}
                >
                  {isEditing ? "Done" : "Edit Profile"}
                </Button>
              </div>

              {isEditing && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5">
                  <div>
                    <label className="text-white/80 text-sm mb-2 block">Email</label>
                    <Input defaultValue="jordan@example.com" className="bg-background/50 border-white/10 text-white" />
                  </div>
                  <div>
                    <label className="text-white/80 text-sm mb-2 block">Phone</label>
                    <Input defaultValue="+1 (555) 123-4567" className="bg-background/50 border-white/10 text-white" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="reservations" className="space-y-6">
            <TabsList className="bg-card/50 border border-white/5">
              <TabsTrigger value="reservations">Upcoming Reservations</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="history">Dining History</TabsTrigger>
            </TabsList>

            {/* Upcoming Reservations */}
            <TabsContent value="reservations">
              <div className="space-y-4">
                {upcomingReservations.map(res => (
                  <Card key={res.id} className="bg-card/50 border-white/5 backdrop-blur-sm hover:border-primary/30 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-heading text-lg text-white mb-2">{res.restaurant}</h3>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" /> {res.date}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" /> {res.time} • {res.party}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">{res.status}</Badge>
                          <Button size="sm" variant="outline" className="border-white/10 text-white hover:bg-white/5">
                            Modify
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Favorites */}
            <TabsContent value="favorites">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {favorites.map(fav => (
                  <Card key={fav.id} className="bg-card/50 border-white/5 backdrop-blur-sm">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-heading text-lg text-white">{fav.name}</h3>
                          <p className="text-sm text-muted-foreground">{fav.cuisine}</p>
                        </div>
                        <Heart className="w-5 h-5 text-primary fill-primary" />
                      </div>
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < Math.floor(fav.rating) ? "text-primary" : "text-muted-foreground"}>★</span>
                        ))}
                      </div>
                      <Button size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        Book a Table
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Dining History */}
            <TabsContent value="history">
              <div className="space-y-4">
                {pastReservations.map(res => (
                  <Card key={res.id} className="bg-card/50 border-white/5">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-heading text-lg text-white mb-1">{res.restaurant}</h3>
                          <p className="text-sm text-muted-foreground">{res.date}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < res.rating ? "text-primary" : "text-muted-foreground"}>★</span>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </CustomerLayout>
  );
}
