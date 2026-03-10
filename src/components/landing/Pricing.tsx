import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface PricingPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  subscription_type: string;
  duration_days: number | null;
  features: string[];
}

const gradients: Record<string, string> = {
  free: "from-gray-500/5 to-gray-600/5",
  monthly: "from-primary/10 to-purple-500/10",
  yearly: "from-emerald-500/10 to-teal-500/10",
  lifetime: "from-amber-500/10 to-orange-500/10",
};

const ctaTexts: Record<string, string> = {
  free: "Bepul boshlash",
  monthly: "Oylik olish",
  yearly: "Yillik olish",
  lifetime: "Lifetime olish",
};

export const Pricing = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data } = await supabase
        .from("pricing_plans")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (data) {
        const mappedPlans = data.map(plan => ({
          ...plan,
          features: Array.isArray(plan.features) 
            ? plan.features.map(f => String(f))
            : []
        }));
        setPlans(mappedPlans);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "0";
    return new Intl.NumberFormat('uz-UZ').format(price);
  };

  const getPeriod = (plan: PricingPlan) => {
    if (plan.subscription_type === "lifetime") return "bir martalik";
    if (plan.subscription_type === "yearly") return "yillik";
    if (plan.subscription_type === "monthly") return "oylik";
    return null;
  };

  const popularPlan = plans.find(p => p.slug === "monthly") || plans[1];

  return (
    <section id="pricing" className="py-8 sm:py-12 md:py-16 relative">
      <div className="container relative mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-10"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-3 sm:mb-4">
            Oddiy va <span className="text-primary">tushunarli</span> narxlar
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Bepul boshlang yoki premium imkoniyatlarga ega bo'ling
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${plans.length <= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-4 sm:gap-6 max-w-6xl mx-auto`}>
            {plans.map((plan, index) => {
              const isPopular = plan.id === popularPlan?.id;
              const gradient = gradients[plan.subscription_type] || gradients.monthly;
              const cta = ctaTexts[plan.subscription_type] || "Tanlash";
              const period = getPeriod(plan);

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative ${isPopular ? 'sm:-mt-4 sm:mb-4' : ''}`}
                >
                  <div className={`glass-card p-5 sm:p-8 h-full bg-gradient-to-br ${gradient} ${isPopular ? 'ring-2 ring-primary' : ''}`}>
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <div className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-primary text-primary-foreground text-[10px] sm:text-xs font-medium shadow-lg whitespace-nowrap">
                          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          Eng mashhur
                        </div>
                      </div>
                    )}

                    <div className="text-center mb-5 sm:mb-8">
                      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1.5 sm:mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                        {plan.description}
                      </p>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                          {formatPrice(plan.price)}
                        </span>
                        {plan.price !== 0 && (
                          <span className="text-muted-foreground text-xs sm:text-sm">so'm</span>
                        )}
                      </div>
                      {period && (
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          /{period}
                        </span>
                      )}
                    </div>

                    <ul className="space-y-2 sm:space-y-3 mb-5 sm:mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2 sm:gap-3">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" />
                          </div>
                          <span className="text-xs sm:text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link to={user ? "/payment" : "/auth"} className="block">
                      <Button 
                        variant={isPopular ? "default" : "outline"} 
                        className={`w-full rounded-full h-10 sm:h-11 text-sm ${isPopular ? 'shadow-lg' : ''}`}
                      >
                        {cta}
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-xs sm:text-sm text-muted-foreground mt-6 sm:mt-10"
        >
          * To'lovlar karta orqali amalga oshiriladi. Admin tasdiqlashidan keyin kirish ochiladi.
        </motion.p>
      </div>
    </section>
  );
};
