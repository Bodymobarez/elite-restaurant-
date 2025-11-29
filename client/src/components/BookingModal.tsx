import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useCreateReservation } from "@/lib/api";

const bookingSchema = z.object({
  date: z.string().min(1, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
  guests: z.string().min(1, "Please select number of guests"),
  specialRequests: z.string().optional(),
});

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantName: string;
  restaurantId: string;
}

export function BookingModal({ open, onOpenChange, restaurantName, restaurantId }: BookingModalProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const createReservation = useCreateReservation();
  
  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      date: "",
      time: "",
      guests: "",
      specialRequests: "",
    },
  });

  async function onSubmit(values: z.infer<typeof bookingSchema>) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Please sign in",
        description: "You need to be logged in to make a reservation.",
      });
      onOpenChange(false);
      setLocation("/auth");
      return;
    }

    try {
      const reservation = await createReservation.mutateAsync({
        userId: user.id,
        restaurantId,
        date: values.date,
        time: values.time,
        partySize: parseInt(values.guests),
        specialRequests: values.specialRequests || undefined,
      });
      
      toast({
        title: "Reservation Confirmed!",
        description: `Your booking at ${restaurantName} has been confirmed. Confirmation code: ${reservation.confirmationCode}`,
      });
      onOpenChange(false);
      form.reset();
      setLocation(`/booking-confirmation?code=${reservation.confirmationCode}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Booking failed",
        description: "Could not complete your reservation. Please try again.",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 border-white/10 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading text-white">Book Your Table</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            at {restaurantName}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80 text-xs">Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      className="bg-background/50 border-white/10 text-white"
                      data-testid="input-booking-date"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />

              <FormField control={form.control} name="time" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80 text-xs">Time</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="bg-background/50 border-white/10 text-white" data-testid="select-booking-time">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-white/10">
                      {["5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM"].map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />

              <FormField control={form.control} name="guests" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80 text-xs">Guests</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="bg-background/50 border-white/10 text-white" data-testid="select-booking-guests">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-white/10">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num} {num === 1 ? 'Guest' : 'Guests'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="specialRequests" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white/80 text-sm">Special Requests (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Any dietary restrictions, celebrations, or special requests..." 
                    {...field} 
                    className="bg-background/50 border-white/10 text-white resize-none"
                    data-testid="textarea-special-requests"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {!user && (
              <div className="text-sm text-muted-foreground bg-white/5 rounded-lg p-3 border border-white/10">
                Please sign in to complete your booking. Your reservation details will be saved.
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 border-white/10 text-white hover:bg-white/5"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-booking"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={createReservation.isPending}
                data-testid="button-confirm-booking"
              >
                {createReservation.isPending ? "Confirming..." : "Confirm Booking"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
