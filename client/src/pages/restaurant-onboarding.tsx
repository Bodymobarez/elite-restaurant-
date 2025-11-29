import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CheckCircle2, ArrowRight, Loader2, Store } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCreateRestaurant } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const restaurantSchema = z.object({
  name: z.string().min(2, "Restaurant name is required"),
  cuisine: z.string().min(2, "Cuisine type is required"),
  address: z.string().min(10, "Complete address is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  priceRange: z.string().min(1, "Price range is required"),
  image: z.string().optional(),
});

export default function RestaurantOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const createRestaurant = useCreateRestaurant();

  const form = useForm<z.infer<typeof restaurantSchema>>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: "",
      cuisine: "",
      address: "",
      phone: "",
      description: "",
      priceRange: "$$$",
      image: "",
    },
  });

  async function onSubmit(values: z.infer<typeof restaurantSchema>) {
    try {
      await createRestaurant.mutateAsync({
        name: values.name,
        cuisine: values.cuisine,
        address: values.address,
        phone: values.phone,
        description: values.description,
        priceRange: values.priceRange,
        image: values.image || undefined,
      });
      setCurrentStep(4);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit restaurant application. Please try again.",
      });
    }
  }

  const steps = [
    { number: 1, title: "Basic Info", icon: "📋" },
    { number: 2, title: "Contact", icon: "📞" },
    { number: 3, title: "Details", icon: "📝" },
    { number: 4, title: "Complete", icon: "✓" },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="bg-card/50 border-white/5 backdrop-blur-sm max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <Store className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="font-heading text-2xl text-white mb-4">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">Please sign in as a restaurant owner to register your establishment.</p>
            <Button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.role !== "restaurant_owner") {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="bg-card/50 border-white/5 backdrop-blur-sm max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <Store className="w-16 h-16 text-amber-500 mx-auto mb-6" />
            <h2 className="font-heading text-2xl text-white mb-4">Restaurant Owner Account Required</h2>
            <p className="text-muted-foreground mb-6">Only restaurant owners can register establishments. Please create a restaurant owner account.</p>
            <Button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground">
              Create Account
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-2 transition-all ${
                  currentStep >= step.number
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-white/10 text-muted-foreground"
                }`}>
                  {currentStep > step.number ? "✓" : step.number}
                </div>
                <span className="text-xs text-muted-foreground text-center">{step.title}</span>
              </div>
            ))}
          </div>
          <div className="h-1 bg-card rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/50 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        {currentStep < 4 ? (
          <Card className="bg-card/50 border-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-heading">{steps[currentStep - 1].title}</CardTitle>
              <CardDescription>Fill in your restaurant details</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {currentStep === 1 && (
                    <>
                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80">Restaurant Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Lumière" {...field} className="bg-background/50 border-white/10 text-white" data-testid="input-restaurant-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="cuisine" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80">Cuisine Type</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., French Fine Dining" {...field} className="bg-background/50 border-white/10 text-white" data-testid="input-cuisine" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="priceRange" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80">Price Range</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background/50 border-white/10 text-white" data-testid="select-price-range">
                                <SelectValue placeholder="Select price range" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-card border-white/10">
                              <SelectItem value="$">$ - Budget Friendly</SelectItem>
                              <SelectItem value="$$">$$ - Moderate</SelectItem>
                              <SelectItem value="$$$">$$$ - Upscale</SelectItem>
                              <SelectItem value="$$$$">$$$$ - Fine Dining</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </>
                  )}

                  {currentStep === 2 && (
                    <>
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80">Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 000-0000" {...field} className="bg-background/50 border-white/10 text-white" data-testid="input-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80">Full Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Street, City, State, ZIP" {...field} className="bg-background/50 border-white/10 text-white" data-testid="input-address" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="image" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80">Restaurant Image URL (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} className="bg-background/50 border-white/10 text-white" data-testid="input-image" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </>
                  )}

                  {currentStep === 3 && (
                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">Tell Us About Your Restaurant</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe your restaurant's ambiance, signature dishes, and dining philosophy..." {...field} className="bg-background/50 border-white/10 text-white min-h-40" data-testid="input-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="button"
                      variant="outline"
                      className="border-white/10 text-white hover:bg-white/5"
                      onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                      disabled={currentStep === 1}
                      data-testid="button-back"
                    >
                      Back
                    </Button>
                    <Button 
                      type={currentStep === 3 ? "submit" : "button"}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                      onClick={() => currentStep < 3 && setCurrentStep(currentStep + 1)}
                      disabled={createRestaurant.isPending}
                      data-testid="button-continue"
                    >
                      {createRestaurant.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          {currentStep === 3 ? "Submit Application" : "Continue"} <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center">
            <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6 animate-bounce" />
            <h2 className="font-heading text-4xl text-white mb-2">Application Submitted!</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Thank you for joining Elite Hub. Your restaurant is now pending approval. Our team will review your application shortly.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                variant="outline"
                className="border-white/10 text-white hover:bg-white/5"
                onClick={() => navigate("/")}
                data-testid="button-home"
              >
                Return to Home
              </Button>
              <Button 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => navigate("/dashboard")}
                data-testid="button-dashboard"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
