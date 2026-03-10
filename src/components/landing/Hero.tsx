import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Hero = () => {
  const { user } = useAuth();
  const [heroText, setHeroText] = useState({ title: "AI promtlar, kurslar, qo'llanmalar va darslar — bir platformada", subtitle: "Vaqtingizni tejang, natijalaringizni oshiring." });

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
    <section className="relative min-h-[70vh] sm:min-h-[80vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Subtle animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden opacity-20 sm:opacity-30">
        <motion.div
          animate={{ 
            x: [0, 60, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-0 sm:left-1/4 w-[300px] sm:w-[500px] md:w-[600px] h-[300px] sm:h-[500px] md:h-[600px] bg-primary/20 rounded-full blur-[80px] sm:blur-[120px]"
        />
        <motion.div
          animate={{ 
            x: [0, -40, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-0 sm:right-1/4 w-[250px] sm:w-[400px] md:w-[500px] h-[250px] sm:h-[400px] md:h-[500px] bg-primary/15 rounded-full blur-[60px] sm:blur-[100px]"
        />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 sm:px-6 pt-24 sm:pt-20 pb-8 sm:pb-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline with iPhone-style Selection Highlight */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.2] sm:leading-[1.15] tracking-tight mb-4 sm:mb-6"
          >
            {/* Highlighted text with iPhone selection style */}
            <span className="relative inline-block">
              {/* Selection box background */}
              <span className="absolute -inset-x-1.5 sm:-inset-x-2 md:-inset-x-3 -inset-y-0.5 sm:-inset-y-1 bg-primary/20 rounded-lg" />
              
              {/* iOS-style handle - top left */}
              <span className="absolute -left-2.5 sm:-left-3.5 md:-left-4 -top-1.5 sm:-top-2 flex flex-col items-center">
                <span className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 bg-primary rounded-full shadow-lg shadow-primary/40 -mb-0.5 sm:-mb-1" />
                <span className="w-0.5 h-6 sm:h-8 md:h-10 bg-primary rounded-full" />
              </span>
              
              {/* iOS-style handle - bottom right */}
              <span className="absolute -right-2.5 sm:-right-3.5 md:-right-4 -bottom-1.5 sm:-bottom-2 flex flex-col items-center">
                <span className="w-0.5 h-6 sm:h-8 md:h-10 bg-primary rounded-full" />
                <span className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 bg-primary rounded-full shadow-lg shadow-primary/40 -mt-0.5 sm:-mt-1" />
              </span>
              
              <span className="relative z-10 text-foreground">AI Promtlar, Kurslar</span>
            </span>
            <br />
            <span className="text-foreground mt-1 sm:mt-2 inline-block">va Video Darslar</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-10 leading-relaxed px-2"
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
                className="rounded-full px-6 sm:px-8 h-11 sm:h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 text-sm sm:text-base font-medium"
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
