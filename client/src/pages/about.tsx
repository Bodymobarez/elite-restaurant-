import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Award, Users, Utensils, Globe } from "lucide-react";

export default function About() {
  return (
    <CustomerLayout>
      <div className="pt-32 pb-20 px-6">
        {/* Hero */}
        <div className="max-w-4xl mx-auto mb-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="font-heading text-5xl md:text-6xl text-white mb-6">
              Our Story
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Elite Hub was born from a passion for connecting discerning diners with the world's most exceptional culinary establishments.
            </p>
          </motion.div>
        </div>

        {/* Values Grid */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {[
            { icon: Award, title: "Excellence", desc: "Only the finest establishments" },
            { icon: Users, title: "Community", desc: "Connecting chefs and diners" },
            { icon: Utensils, title: "Culinary Art", desc: "Celebrating food as art" },
            { icon: Globe, title: "Global", desc: "World-class dining worldwide" }
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
                <Card className="bg-card/50 border-white/5 text-center">
                  <CardContent className="pt-8 flex flex-col items-center">
                    <Icon className="w-10 h-10 text-primary mb-4" />
                    <h3 className="font-heading text-lg text-white mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="max-w-6xl mx-auto bg-card/50 border border-white/5 rounded-xl p-12 mb-20">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="font-heading text-4xl text-primary mb-2">150+</div>
              <p className="text-muted-foreground">Premium Restaurants</p>
            </div>
            <div>
              <div className="font-heading text-4xl text-primary mb-2">50K+</div>
              <p className="text-muted-foreground">Happy Diners</p>
            </div>
            <div>
              <div className="font-heading text-4xl text-primary mb-2">15</div>
              <p className="text-muted-foreground">Countries</p>
            </div>
          </div>
        </div>

        {/* Mission */}
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-4xl text-white mb-6">Our Mission</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            At Elite Hub, we believe that exceptional dining is more than just a meal—it's an experience. We're dedicated to showcasing the artistry and passion of world-class chefs while helping the most discerning diners discover their next unforgettable evening.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Through our platform, we empower restaurants to manage their operations seamlessly, connect directly with their audience, and continue crafting culinary masterpieces.
          </p>
        </div>
      </div>
    </CustomerLayout>
  );
}
