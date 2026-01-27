import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Hero = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ prompts: 0, categories: 0, users: 0 });
  const [heroText, setHeroText] = useState({ title: "Marketing promtlari bazasi", subtitle: "Vaqtingizni tejang, natijalaringizni oshiring." });

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase.rpc('get_public_stats');
      
      if (data && !error) {
        const statsData = data as { prompts_count: number; categories_count: number; users_count: number };
        setStats({
          prompts: statsData.prompts_count || 0,
          categories: statsData.categories_count || 0,
          users: statsData.users_count || 0,
        });
      }
    };

    const fetchHeroText = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "hero_text")
        .single();
      
      if (data?.value) {
        const value = data.value as { title?: string; subtitle?: string };
        setHeroText({
          title: value.title || heroText.title,
          subtitle: value.subtitle || heroText.subtitle,
        });
      }
    };

    fetchStats();
    fetchHeroText();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Subtle animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ 
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[100px]"
        />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline with iPhone-style Selection Highlight */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.15] tracking-tight mb-6"
          >
            {/* Highlighted text with iPhone selection style */}
            <span className="relative inline-block">
              {/* Selection box background */}
              <span className="absolute -inset-x-3 -inset-y-1 bg-primary/20 rounded-lg" />
              
              {/* Corner handles - top left */}
              <span className="absolute -left-4 -top-2 w-3 h-3 border-2 border-primary bg-primary rounded-full" />
              {/* Corner handles - top right */}
              <span className="absolute -right-4 -top-2 w-3 h-3 border-2 border-primary bg-primary rounded-full" />
              {/* Corner handles - bottom left */}
              <span className="absolute -left-4 -bottom-2 w-3 h-3 border-2 border-primary bg-primary rounded-full" />
              {/* Corner handles - bottom right */}
              <span className="absolute -right-4 -bottom-2 w-3 h-3 border-2 border-primary bg-primary rounded-full" />
              
              {/* Vertical selection lines */}
              <span className="absolute -left-4 top-1 bottom-1 w-0.5 bg-primary" />
              <span className="absolute -right-4 top-1 bottom-1 w-0.5 bg-primary" />
              
              <span className="relative z-10 text-foreground">Marketing Promtlar</span>
            </span>
            <br />
            <span className="text-foreground mt-2 inline-block">va Biznes Strategiyalar</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {heroText.title}. {heroText.subtitle}
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/prompts">
              <Button 
                size="lg" 
                className="rounded-full px-8 h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 text-base font-medium"
              >
                Promtlarni ko'rish
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-24 grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto"
          >
            {[
              { icon: Target, value: stats.prompts > 0 ? `${stats.prompts}+` : "0", label: "Promtlar" },
              { icon: Zap, value: stats.categories > 0 ? `${stats.categories}` : "0", label: "Kategoriyalar" },
              { icon: Sparkles, value: stats.users > 0 ? `${stats.users}+` : "0", label: "Foydalanuvchilar" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                className="glass-card p-4 md:p-6 text-center"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <span className="block text-2xl md:text-3xl font-bold text-foreground tracking-tight">{stat.value}</span>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
