import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight } from "lucide-react";

const restaurantSchema = z.object({
  name: z.string().min(2, "Restaurant name is required"),
  email: z.string().email("Invalid email"),
  cuisine: z.string().min(2, "Cuisine type is required"),
  address: z.string().min(10, "Complete address is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  description: z.string().min(50, "Description must be at least 50 characters"),
});

export default function RestaurantOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const form = useForm<z.infer<typeof restaurantSchema>>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: "",
      email: "",
      cuisine: "",
      address: "",
      phone: "",
      description: "",
    },
  });

  function onSubmit(values: z.infer<typeof restaurantSchema>) {
    console.log(values);
    setCurrentStep(4); // Show success
  }

  const steps = [
    { number: 1, title: "Basic Info", icon: "📋" },
    { number: 2, title: "Contact", icon: "📞" },
    { number: 3, title: "About", icon: "📝" },
    { number: 4, title: "Complete", icon: "✓" },
  ];

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
              <CardTitle className="text-white">{steps[currentStep - 1].title}</CardTitle>
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
                            <Input placeholder="e.g., Lumière" {...field} className="bg-background/50 border-white/10 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="cuisine" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80">Cuisine Type</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., French Fine Dining" {...field} className="bg-background/50 border-white/10 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </>
                  )}

                  {currentStep === 2 && (
                    <>
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80">Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contact@restaurant.com" {...field} className="bg-background/50 border-white/10 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80">Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 000-0000" {...field} className="bg-background/50 border-white/10 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80">Full Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Street, City, State, ZIP" {...field} className="bg-background/50 border-white/10 text-white" />
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
                          <Textarea placeholder="Describe your restaurant's ambiance, signature dishes, and dining philosophy..." {...field} className="bg-background/50 border-white/10 text-white min-h-40" />
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
                    >
                      Back
                    </Button>
                    <Button 
                      type={currentStep === 3 ? "submit" : "button"}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                      onClick={() => currentStep < 3 && setCurrentStep(currentStep + 1)}
                    >
                      {currentStep === 3 ? "Submit" : "Continue"} <ArrowRight className="w-4 h-4" />
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
            <p className="text-muted-foreground mb-8">
              Thank you for joining Elite Hub. Our team will review your application and contact you within 48 hours.
            </p>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Return to Home
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
