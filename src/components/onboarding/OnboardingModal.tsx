import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, BookOpen, Gift, ArrowRight, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface OnboardingModalProps {
  userId: string;
  profileId: string;
  onComplete: () => void;
}

const steps = [
  {
    icon: Sparkles,
    title: "MPBS.uz ga xush kelibsiz! 🎉",
    description: "AI marketing promtlari bazasiga kirganingiz bilan tabriklaymiz. Bu yerda siz professional marketing natijalariga erishish uchun tayyor promtlarni topasiz.",
    color: "from-primary to-primary/60",
  },
  {
    icon: BookOpen,
    title: "Qanday ishlaydi?",
    description: "1. Kerakli promtni tanlang\n2. Nusxalab, ChatGPT ga joylashtiring\n3. O'z mahsulotingiz ma'lumotlarini qo'shing\n4. Professional natija oling!",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Gift,
    title: "Referral dasturi 💰",
    description: "Do'stlaringizni taklif qiling va ularning har bir xarididan 10% komissiya oling. Daromadni naqd yechib olishingiz yoki obunaga almashtirish mumkin!",
    color: "from-emerald-500 to-emerald-600",
  },
];

const OnboardingModal = ({ userId, profileId, onComplete }: OnboardingModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  const handleComplete = async () => {
    setIsClosing(true);
    await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", profileId);
    setTimeout(onComplete, 300);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const step = steps[currentStep];
  const StepIcon = step.icon;

  return (
    <AnimatePresence>
      {!isClosing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-card rounded-3xl border border-border/50 shadow-2xl overflow-hidden"
          >
            {/* Gradient header */}
            <div className={`bg-gradient-to-br ${step.color} p-8 text-center`}>
              <motion.div
                key={currentStep}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4"
              >
                <StepIcon className="w-8 h-8 text-white" />
              </motion.div>
              <motion.h2
                key={`title-${currentStep}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-bold text-white"
              >
                {step.title}
              </motion.h2>
            </div>

            {/* Content */}
            <div className="p-6">
              <motion.p
                key={`desc-${currentStep}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-muted-foreground whitespace-pre-line text-sm leading-relaxed"
              >
                {step.description}
              </motion.p>

              {/* Step indicators */}
              <div className="flex items-center justify-center gap-2 mt-6 mb-4">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentStep ? "w-8 bg-primary" : i < currentStep ? "w-4 bg-primary/50" : "w-4 bg-muted"
                    }`}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={handleComplete}
                >
                  O'tkazib yuborish
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={handleNext}
                >
                  {currentStep < steps.length - 1 ? (
                    <>Keyingi <ArrowRight className="w-4 h-4" /></>
                  ) : (
                    <>Boshlash <Check className="w-4 h-4" /></>
                  )}
                </Button>
              </div>

              {/* Quick links on last step */}
              {currentStep === steps.length - 1 && (
                <div className="mt-4 flex gap-2 justify-center">
                  <Link to="/prompts" onClick={handleComplete}>
                    <Button variant="link" size="sm" className="text-xs">Promtlarni ko'rish →</Button>
                  </Link>
                  <Link to="/courses" onClick={handleComplete}>
                    <Button variant="link" size="sm" className="text-xs">Kurslarni ko'rish →</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OnboardingModal;
