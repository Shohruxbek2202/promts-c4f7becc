import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Gift, Users, Wallet, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Users,
    title: "Do'stlaringizni taklif qiling",
    description: "Maxsus referral linkingizni ulashing",
  },
  {
    icon: Gift,
    title: "Ular xarid qilsin",
    description: "Sizning linkingiz orqali obuna bo'lishsin",
  },
  {
    icon: Wallet,
    title: "10% komissiya oling",
    description: "Har bir muvaffaqiyatli to'lov uchun",
  },
];

export const Referral = () => {
  return (
    <section id="referral" className="py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="relative max-w-5xl mx-auto">
          {/* Background decoration */}
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative bg-gradient-card rounded-3xl p-8 md:p-12 border border-border shadow-lg"
          >
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 mb-6">
                  <Gift className="w-4 h-4 text-secondary" />
                  <span className="text-sm font-medium text-secondary">Referral dasturi</span>
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Pul ishlang, do'stlaringizga yordam bering
                </h2>
                <p className="text-muted-foreground mb-8">
                  Har bir muvaffaqiyatli referral uchun 10% komissiya oling. 
                  Minimal to'lov chegarasi 100,000 so'm.
                </p>
                <Button variant="hero" size="lg">
                  Hoziroq boshlash
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              {/* Right Content - Steps */}
              <div className="space-y-6">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-foreground mb-1">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
