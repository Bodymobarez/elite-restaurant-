import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle, Calendar, Users, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BookingConfirmation() {
  const reservation = {
    id: "RES-2025-001847",
    restaurant: "Lumière",
    date: "December 20, 2025",
    time: "7:30 PM",
    party: "4 guests",
    location: "Downtown, Metropolis",
    confirmationCode: "ELITE7890"
  };

  return (
    <CustomerLayout>
      <div className="pt-32 pb-20 px-6 min-h-screen flex items-center">
        <div className="max-w-md mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-6 animate-pulse" />
            <h1 className="font-heading text-4xl text-white mb-2">Reservation Confirmed</h1>
            <p className="text-muted-foreground">Your table has been secured</p>
          </motion.div>

          <Card className="bg-card/50 border-white/5 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle className="text-white">{reservation.restaurant}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-background/50 p-4 rounded-lg border border-white/5">
                <p className="text-xs text-muted-foreground mb-1">Confirmation Code</p>
                <p className="font-heading text-2xl text-primary tracking-wider">{reservation.confirmationCode}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary/60" />
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="text-white font-medium">{reservation.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary/60" />
                  <div>
                    <p className="text-xs text-muted-foreground">Time</p>
                    <p className="text-white font-medium">{reservation.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary/60" />
                  <div>
                    <p className="text-xs text-muted-foreground">Party Size</p>
                    <p className="text-white font-medium">{reservation.party}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary/60" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-white font-medium">{reservation.location}</p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <p className="text-sm text-amber-200">
                  A confirmation email has been sent. Please arrive 10 minutes early.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Link href="/restaurants" className="flex-1">
              <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5">
                Continue Exploring
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Back Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}

// Add framer-motion import at top
import { motion } from "framer-motion";
