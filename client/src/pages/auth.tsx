import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import logo from "@assets/generated_images/minimalist_gold_luxury_logo_icon.png";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    // Mock authentication logic
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Welcome back",
        description: "You have successfully logged in.",
      });

      // Simple mock routing based on email
      if (values.email.includes("admin")) {
        setLocation("/admin");
      } else if (values.email.includes("rest")) {
        setLocation("/dashboard");
      } else {
        setLocation("/");
      }
    }, 1500);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md border-white/10 bg-card/50 backdrop-blur-xl relative z-10 shadow-2xl">
        <CardHeader className="space-y-1 flex flex-col items-center text-center pb-8">
          <Link href="/" className="mb-6 group cursor-pointer">
            <img src={logo} alt="Elite Hub" className="w-12 h-12 rounded-full border border-primary/20 group-hover:border-primary/60 transition-all" />
          </Link>
          <CardTitle className="text-2xl font-heading text-white">Welcome to Elite Hub</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-background/50 border border-white/5">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">Email</FormLabel>
                        <FormControl>
                          <Input placeholder="name@example.com" {...field} className="bg-background/50 border-white/10 focus:border-primary/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} className="bg-background/50 border-white/10 focus:border-primary/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-4" disabled={isLoading}>
                    {isLoading ? "Authenticating..." : "Sign In"}
                  </Button>
                </form>
              </Form>
              
              <div className="mt-6 text-center text-sm text-muted-foreground">
                <p>Demo Accounts:</p>
                <div className="flex justify-center gap-4 mt-2 text-xs">
                  <button onClick={() => form.setValue("email", "admin@elite.com")} className="hover:text-primary underline">Admin</button>
                  <button onClick={() => form.setValue("email", "rest@elite.com")} className="hover:text-primary underline">Restaurant</button>
                  <button onClick={() => form.setValue("email", "user@elite.com")} className="hover:text-primary underline">User</button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="signup">
              <div className="text-center py-8 text-muted-foreground">
                <p>Registration is currently invitation only.</p>
                <Button variant="link" className="text-primary mt-2">Request an invite</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
