import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Gift, Users, Wallet, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const steps = [
  {
    icon: Users,
    title: "Do'stlaringizni taklif qiling",
    description: "Maxsus referral linkingizni ulashing",
    gradient: "from-blue-500/20 to-blue-600/10",
    iconColor: "text-blue-500",
  },
  {
    icon: Gift,
    title: "Ular xarid qilsin",
    description: "Sizning linkingiz orqali obuna bo'lishsin",
    gradient: "from-purple-500/20 to-purple-600/10",
    iconColor: "text-purple-500",
  },
  {
    icon: Wallet,
    title: "10% komissiya oling",
    description: "Har bir muvaffaqiyatli to'lov uchun",
    gradient: "from-green-500/20 to-green-600/10",
    iconColor: "text-green-500",
  },
];

export const Referral = () => {
  const { user } = useAuth();

  return (
    <section id="referral" className="py-8 sm:py-12 md:py-16 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="relative max-w-5xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative glass-card p-5 sm:p-8 md:p-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
              {/* Left Content */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 mb-4 sm:mb-6">
                  <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  <span className="text-xs sm:text-sm font-medium text-primary">Referral dasturi</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3 sm:mb-4">
                  Pul ishlang, do'stlaringizga yordam bering
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-5 sm:mb-8 leading-relaxed">
                  Har bir muvaffaqiyatli referral uchun 10% komissiya oling. 
                  Minimal to'lov chegarasi 100,000 so'm.
                </p>
                <Link to={user ? "/dashboard" : "/auth"}>
                  <Button size="lg" className="rounded-full shadow-lg text-sm sm:text-base">
                    {user ? "Referral kodimni olish" : "Hoziroq boshlash"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>

              {/* Right Content - Steps */}
              <div className="space-y-3 sm:space-y-4">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-background/50"
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center flex-shrink-0`}>
                      <step.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${step.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-foreground mb-0.5 sm:mb-1">
                        {step.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
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
