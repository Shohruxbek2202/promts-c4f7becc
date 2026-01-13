import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Star, Sparkles } from "lucide-react";

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
    variant: "heroOutline" as const,
    popular: false,
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
    variant: "hero" as const,
    popular: true,
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
    variant: "accent" as const,
    popular: false,
  },
];

export const Pricing = () => {
  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 mb-6">
            <Star className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-secondary">Oddiy narxlar</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            O'zingizga mos tarifni tanlang
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
              className={`relative bg-card rounded-2xl p-6 md:p-8 border ${
                plan.popular 
                  ? "border-primary shadow-lg scale-105" 
                  : "border-border shadow-card"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    <Sparkles className="w-3 h-3" />
                    Eng mashhur
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-display text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">
                    {plan.price !== "0" && " so'm"}
                  </span>
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
              <Button variant={plan.variant} className="w-full" size="lg">
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Payment Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          * To'lovlar karta orqali amalga oshiriladi. Admin tasdiqlashidan keyin kirish ochiladi.
        </motion.p>
      </div>
    </section>
  );
};
