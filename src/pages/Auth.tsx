import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Mail, Lock, ArrowRight, Gift, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Email noto'g'ri formatda" }).max(255),
  password: z.string().min(6, { message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak" }).max(100),
});

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState(searchParams.get("ref") || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, signUp, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !isLoading) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    const result = authSchema.safeParse({ email, password });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login")) {
            toast.error("Email yoki parol noto'g'ri");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Muvaffaqiyatli kirdingiz!");
          navigate("/");
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("Bu email allaqachon ro'yxatdan o'tgan");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Ro'yxatdan muvaffaqiyatli o'tdingiz!");
          
          // If referral code provided, link it after signup
          if (referralCode.trim()) {
            // Wait a bit for the profile to be created
            setTimeout(async () => {
              await linkReferralCode(referralCode.trim());
            }, 1000);
          }
          
          navigate("/");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const linkReferralCode = async (code: string) => {
    try {
      // Find referrer by code
      const { data: referrer } = await supabase
        .from("profiles")
        .select("id")
        .eq("referral_code", code.toUpperCase())
        .maybeSingle();

      if (referrer) {
        // Get current user's profile
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          // Update current user's profile with referrer
          await supabase
            .from("profiles")
            .update({ referred_by: referrer.id })
            .eq("user_id", currentUser.id);
        }
      }
    } catch (error) {
      console.error("Error linking referral:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="glass-card p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-glass">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">
              PromptsHub
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {isLogin ? "Hisobingizga kiring" : "Ro'yxatdan o'ting"}
          </h1>
          <p className="text-muted-foreground">
            {isLogin
              ? "100,000+ marketing promtlariga kirish"
              : "Bepul hisob oching va promtlardan foydalaning"}
          </p>
        </div>

        {/* Form */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="sizning@email.uz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl glass-button border-0"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Parol</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 rounded-xl glass-button border-0"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Referral Code - Only show on signup */}
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="referral" className="text-foreground flex items-center gap-2">
                  <Gift className="w-4 h-4 text-primary" />
                  Referral kod (ixtiyoriy)
                </Label>
                <Input
                  id="referral"
                  type="text"
                  placeholder="XXXXXXXX"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  className="h-12 rounded-xl glass-button border-0 uppercase tracking-widest"
                  maxLength={8}
                />
                <p className="text-xs text-muted-foreground">
                  Do'stingiz kodini kiriting va ikkalangiz ham foyda oling
                </p>
              </div>
            )}

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full h-12 rounded-xl"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Kutib turing...
                </div>
              ) : (
                <>
                  {isLogin ? "Kirish" : "Ro'yxatdan o'tish"}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? (
                <>
                  Hisobingiz yo'qmi?{" "}
                  <span className="text-primary font-medium">Ro'yxatdan o'ting</span>
                </>
              ) : (
                <>
                  Allaqachon hisobingiz bormi?{" "}
                  <span className="text-primary font-medium">Kiring</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Bosh sahifaga qaytish
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
