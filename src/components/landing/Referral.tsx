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
    <section id="referral" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="relative max-w-5xl mx-auto">
          {/* Background decoration */}
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative glass-card p-8 md:p-12"
          >
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6">
                  <Gift className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Referral dasturi</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4">
                  Pul ishlang, do'stlaringizga yordam bering
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Har bir muvaffaqiyatli referral uchun 10% komissiya oling. 
                  Minimal to'lov chegarasi 100,000 so'm.
                </p>
                <Link to={user ? "/dashboard" : "/auth"}>
                  <Button size="lg" className="rounded-full shadow-lg">
                    {user ? "Referral kodimni olish" : "Hoziroq boshlash"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>

              {/* Right Content - Steps */}
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-background/50"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center flex-shrink-0`}>
                      <step.icon className={`w-6 h-6 ${step.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
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
