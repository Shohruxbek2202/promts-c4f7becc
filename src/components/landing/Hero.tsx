import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Hero = () => {
  const { user } = useAuth();
  const [heroText, setHeroText] = useState({ title: "Marketing promtlari bazasi", subtitle: "Vaqtingizni tejang, natijalaringizni oshiring." });

  useEffect(() => {
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

    fetchHeroText();
  }, []);

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
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
      <div className="container relative z-10 mx-auto px-4 pt-20 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline with iPhone-style Selection Highlight */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.15] tracking-tight mb-6"
          >
            {/* Highlighted text with iPhone selection style */}
            <span className="relative inline-block">
              {/* Selection box background */}
              <span className="absolute -inset-x-2 sm:-inset-x-3 -inset-y-1 bg-primary/20 rounded-lg" />
              
              {/* Corner handle - top left with line */}
              <span className="absolute -left-3 sm:-left-4 -top-2 flex flex-col items-center">
                <span className="w-0.5 h-3 sm:h-4 bg-primary rounded-full -mb-1" />
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-primary rounded-full shadow-lg shadow-primary/30" />
              </span>
              
              {/* Corner handle - bottom right with line */}
              <span className="absolute -right-3 sm:-right-4 -bottom-2 flex flex-col items-center">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-primary rounded-full shadow-lg shadow-primary/30" />
                <span className="w-0.5 h-3 sm:h-4 bg-primary rounded-full -mt-1" />
              </span>
              
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

        </div>
      </div>
    </section>
  );
};
