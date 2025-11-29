import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Users, Clock } from "lucide-react";

const bookingSchema = z.object({
  date: z.string().min(1, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
  guests: z.string().min(1, "Please select number of guests"),
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
});

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantName: string;
}

export function BookingModal({ open, onOpenChange, restaurantName }: BookingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      date: "",
      time: "",
      guests: "",
      name: "",
      email: "",
      phone: "",
    },
  });

  function onSubmit(values: z.infer<typeof bookingSchema>) {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Reservation Confirmed!",
        description: "Your booking at " + restaurantName + " has been confirmed.",
      });
      onOpenChange(false);
      form.reset();
    }, 1500);
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
                    <Input type="date" {...field} className="bg-background/50 border-white/10 text-white" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />

              <FormField control={form.control} name="time" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80 text-xs">Time</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="bg-background/50 border-white/10 text-white">
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
                      <SelectTrigger className="bg-background/50 border-white/10 text-white">
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

            <div className="border-t border-white/5 pt-4">
              <h4 className="font-heading text-white mb-4">Contact Information</h4>
              
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="mb-3">
                  <FormLabel className="text-white/80 text-sm">Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} className="bg-background/50 border-white/10 text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem className="mb-3">
                  <FormLabel className="text-white/80 text-sm">Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="your@email.com" {...field} className="bg-background/50 border-white/10 text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80 text-sm">Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 000-0000" {...field} className="bg-background/50 border-white/10 text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 border-white/10 text-white hover:bg-white/5"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Confirming..." : "Confirm Booking"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
