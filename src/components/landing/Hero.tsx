import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Target, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Hero = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ prompts: 0, categories: 0, users: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [promptsRes, categoriesRes, usersRes] = await Promise.all([
        supabase.from("prompts").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        prompts: promptsRes.count || 0,
        categories: categoriesRes.count || 0,
        users: usersRes.count || 0,
      });
    };
    fetchStats();
  }, []);
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-hero" />
      
      {/* Animated orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, 30, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 pt-32 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-foreground">{stats.prompts > 0 ? `${stats.prompts.toLocaleString()}+ professional promtlar` : "Professional promtlar to'plami"}</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6"
          >
            Marketing promtlar{" "}
            <span className="text-gradient">bazasi</span>
            <br />
            <span className="text-muted-foreground">eng katta to'plami</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Google Ads, Meta Ads, Yandex Direct va boshqa platformalar uchun 
            tayyor promtlar. Vaqtingizni tejang, natijani oshiring.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to={user ? "/dashboard" : "/auth"}>
              <Button size="lg" className="rounded-full px-8 h-12 shadow-lg shadow-primary/25 text-base">
                {user ? "Dashboardga o'tish" : "Bepul boshlash"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/prompts">
              <Button variant="outline" size="lg" className="rounded-full px-8 h-12 glass-button text-base">
                <Play className="w-4 h-4 mr-2" />
                Promtlarni ko'rish
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-20 grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto"
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

      {/* Floating elements */}
      <motion.div
        animate={{ y: [-8, 8, -8] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-40 right-[15%] hidden lg:block"
      >
        <div className="glass-card w-14 h-14 flex items-center justify-center">
          <span className="text-2xl">🎯</span>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [8, -8, 8] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-40 left-[15%] hidden lg:block"
      >
        <div className="glass-card w-14 h-14 flex items-center justify-center">
          <span className="text-2xl">✨</span>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [-5, 10, -5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-60 left-[10%] hidden lg:block"
      >
        <div className="glass-card w-12 h-12 flex items-center justify-center">
          <span className="text-xl">🚀</span>
        </div>
      </motion.div>
    </section>
  );
};
