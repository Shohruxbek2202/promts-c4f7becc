import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const Hero = () => {
  const { user } = useAuth();

  return (
    <section className="relative min-h-screen bg-gradient-hero overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-card mb-8"
          >
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-foreground">100,000+ professional marketing prompts</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
          >
            Marketing promtlar{" "}
            <span className="text-gradient">bazasi</span>
            <br />
            eng katta to'plami
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Google Ads, Meta Ads, Yandex Direct va boshqa platformalar uchun 
            tayyor promtlar. Vaqtingizni tejang, natijani oshiring.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to={user ? "/dashboard" : "/auth"}>
              <Button variant="hero" size="xl">
                {user ? "Dashboardga o'tish" : "Bepul boshlash"}
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
            <Link to="/prompts">
              <Button variant="heroOutline" size="xl">
                Promtlarni ko'rish
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {[
              { icon: Target, value: "100K+", label: "Promtlar" },
              { icon: Zap, value: "50+", label: "Kategoriyalar" },
              { icon: Sparkles, value: "10K+", label: "Foydalanuvchilar" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-xl bg-card border border-border shadow-card flex items-center justify-center mb-3">
                  <stat.icon className="w-6 h-6 text-secondary" />
                </div>
                <span className="font-display text-2xl md:text-3xl font-bold text-foreground">{stat.value}</span>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Floating elements */}
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-40 right-20 hidden lg:block"
      >
        <div className="w-16 h-16 rounded-2xl bg-card border border-border shadow-lg flex items-center justify-center">
          <span className="text-2xl">🎯</span>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [10, -10, 10] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-40 left-20 hidden lg:block"
      >
        <div className="w-16 h-16 rounded-2xl bg-card border border-border shadow-lg flex items-center justify-center">
          <span className="text-2xl">✨</span>
        </div>
      </motion.div>
    </section>
  );
};
