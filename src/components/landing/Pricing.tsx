import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const pricingPlans = [
  {
    name: "Bepul",
    price: "0",
    description: "Boshlash uchun ideal",
    features: [
      "Kuniga 5 ta promtga kirish",
      "Asosiy kategoriyalar",
      "Email yordam",
      "Telegram community",
    ],
    cta: "Bepul boshlash",
    popular: false,
    gradient: "from-gray-500/5 to-gray-600/5",
  },
  {
    name: "Pro",
    price: "99,000",
    period: "oylik",
    description: "Professional marketologlar uchun",
    features: [
      "Cheksiz promtlarga kirish",
      "Barcha kategoriyalar",
      "Fayllar va resurslar",
      "Prioritet yordam",
      "Yangi promtlar birinchi",
      "10% referral bonus",
    ],
    cta: "Pro'ga o'tish",
    popular: true,
    gradient: "from-primary/10 to-purple-500/10",
  },
  {
    name: "Lifetime",
    price: "499,000",
    period: "bir martalik",
    description: "Umrbod kirish",
    features: [
      "Pro tarifning barcha imkoniyatlari",
      "Umrbod yangilanishlar",
      "VIP Telegram guruh",
      "1-on-1 konsultatsiya",
      "Agency promtlariga kirish",
      "Maxsus so'rovlar bo'yicha promtlar",
    ],
    cta: "Lifetime olish",
    popular: false,
    gradient: "from-amber-500/10 to-orange-500/10",
  },
];

export const Pricing = () => {
  const { user } = useAuth();

  return (
    <section id="pricing" className="py-24 relative">
      <div className="absolute inset-0 bg-muted/30" />
      
      <div className="container relative mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4">
            Oddiy va tushunarli narxlar
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Bepul boshlang yoki premium imkoniyatlarga ega bo'ling
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
            >
              <div className={`glass-card p-8 h-full bg-gradient-to-br ${plan.gradient} ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium shadow-lg">
                      <Sparkles className="w-3.5 h-3.5" />
                      Eng mashhur
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-foreground tracking-tight">
                      {plan.price}
                    </span>
                    {plan.price !== "0" && (
                      <span className="text-muted-foreground text-sm">so'm</span>
                    )}
                  </div>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground">
                      /{plan.period}
                    </span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link to={user ? "/payment" : "/auth"} className="block">
                  <Button 
                    variant={plan.popular ? "default" : "outline"} 
                    className={`w-full rounded-full h-11 ${plan.popular ? 'shadow-lg' : ''}`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Payment Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-sm text-muted-foreground mt-10"
        >
          * To'lovlar karta orqali amalga oshiriladi. Admin tasdiqlashidan keyin kirish ochiladi.
        </motion.p>
      </div>
    </section>
  );
};
