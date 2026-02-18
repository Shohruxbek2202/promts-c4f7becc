import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Mail, Lock, ArrowRight, Gift, ArrowLeft, Eye, EyeOff, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Email noto'g'ri formatda" }).max(255),
  password: z.string().min(6, { message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak" }).max(100),
});

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState(searchParams.get("ref") || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Brute-force protection
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const { signIn, signUp, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !isLoading) {
      navigate("/dashboard");
    }
  }, [user, isLoading, navigate]);

  // Lockout countdown
  const [lockoutSecondsLeft, setLockoutSecondsLeft] = useState(0);
  useEffect(() => {
    if (!lockoutUntil) return;
    const interval = setInterval(() => {
      const left = Math.ceil((lockoutUntil - Date.now()) / 1000);
      if (left <= 0) {
        setLockoutUntil(null);
        setLoginAttempts(0);
        setLockoutSecondsLeft(0);
      } else {
        setLockoutSecondsLeft(left);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Brute-force check (only for login)
    if (isLogin && !isForgotPassword) {
      if (lockoutUntil && Date.now() < lockoutUntil) {
        toast.error(`Juda ko'p urinish. ${lockoutSecondsLeft} soniya kuting.`);
        return;
      }
    }
    
    if (isForgotPassword) {
      if (!email.trim()) { toast.error("Emailni kiriting"); return; }
      setIsSubmitting(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) { toast.error(error.message); }
        else { toast.success("Parolni tiklash havolasi emailga yuborildi!"); setIsForgotPassword(false); }
      } finally { setIsSubmitting(false); }
      return;
    }

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
          const newAttempts = loginAttempts + 1;
          setLoginAttempts(newAttempts);
          if (newAttempts >= 5) {
            const lockDuration = 30 * 1000; // 30 seconds
            setLockoutUntil(Date.now() + lockDuration);
            setLockoutSecondsLeft(30);
            toast.error("5 ta noto'g'ri urinish. 30 soniya kuting.", { duration: 5000 });
          } else {
            const remaining = 5 - newAttempts;
            if (error.message.includes("Invalid login")) {
              toast.error(`Email yoki parol noto'g'ri. ${remaining} ta urinish qoldi.`);
            } else {
              toast.error(error.message);
            }
          }
        } else {
          setLoginAttempts(0);
          setLockoutUntil(null);
          toast.success("Muvaffaqiyatli kirdingiz!");
          navigate("/dashboard");
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
          if (referralCode.trim()) {
            setTimeout(async () => {
              await linkReferralCode(referralCode.trim());
            }, 1000);
          }
          toast.success("Ro'yxatdan muvaffaqiyatli o'tdingiz! Emailingizni tasdiqlang.", { duration: 6000 });
          setIsLogin(true);
          setPassword("");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const linkReferralCode = async (code: string) => {
    try {
      const { data: referrer } = await supabase
        .from("profiles")
        .select("id")
        .eq("referral_code", code.toUpperCase())
        .maybeSingle();

      if (referrer) {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  const features = [
    "Marketing promtlari",
    "Barcha platformalar uchun tayyor",
    "Muntazam yangilanishlar",
    "10% referral komissiya",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        <motion.div
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-3xl"
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 xl:p-16">
          <Link to="/" className="inline-flex items-center gap-3 mb-12">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
              <Sparkles className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              MPBS.uz
            </span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl xl:text-5xl font-bold text-foreground leading-tight mb-6">
              Marketing <span className="text-gradient">promtlari</span> bilan{" "}
              <br />biznesingizni rivojlantiring
            </h1>
            <p className="text-lg text-muted-foreground mb-10 max-w-md">
              Google Ads, Meta Ads, Yandex Direct va boshqa platformalar uchun 
              tayyor promtlar to'plami.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-primary" />
                </div>
                <span className="text-foreground">{feature}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Floating Elements */}
          <motion.div
            animate={{ y: [-8, 8, -8] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-20"
          >
            <div className="w-16 h-16 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-lg">
              <span className="text-3xl">🎯</span>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [8, -8, 8] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-32 right-32"
          >
            <div className="w-14 h-14 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-lg">
              <span className="text-2xl">✨</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">
                MPBS.uz
              </span>
            </Link>
          </div>

          {/* Form Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
              {isForgotPassword ? "Parolni tiklash" : isLogin ? "Xush kelibsiz!" : "Yangi hisob yarating"}
            </h2>
            <p className="text-muted-foreground">
              {isForgotPassword
                ? "Emailingizni kiriting, parolni tiklash havolasi yuboriladi"
                : isLogin
                ? "Hisobingizga kirish uchun ma'lumotlarni kiriting"
                : "Ro'yxatdan o'ting va promtlardan foydalaning"}
            </p>
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 lg:p-8 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="sizning@email.uz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-12 rounded-xl bg-background/50 border-border/50 focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>

              {!isForgotPassword && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground font-medium">Parol</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 pr-12 h-12 rounded-xl bg-background/50 border-border/50 focus:border-primary transition-colors"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {isLogin && (
                    <div className="text-right">
                      <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs text-primary hover:underline">
                        Parolni unutdingizmi?
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Referral Code - Only show on signup */}
              {!isLogin && !isForgotPassword && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2"
                >
                  <Label htmlFor="referral" className="text-foreground font-medium flex items-center gap-2">
                    <Gift className="w-4 h-4 text-primary" />
                    Referral kod (ixtiyoriy)
                  </Label>
                  <Input
                    id="referral"
                    type="text"
                    placeholder="XXXXXXXX"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    className="h-12 rounded-xl bg-background/50 border-border/50 uppercase tracking-widest font-mono focus:border-primary transition-colors"
                    maxLength={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    Do'stingiz kodini kiriting va ikkalangiz ham foyda oling
                  </p>
                </motion.div>
              )}

              {/* Lockout warning */}
              {lockoutUntil && lockoutSecondsLeft > 0 && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive text-center">
                  🔒 {lockoutSecondsLeft} soniya kuting...
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 rounded-xl text-base font-medium shadow-lg shadow-primary/25"
                disabled={isSubmitting || (isLogin && !!lockoutUntil && lockoutSecondsLeft > 0)}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Kutib turing...
                  </div>
                ) : lockoutUntil && lockoutSecondsLeft > 0 ? (
                  <>🔒 {lockoutSecondsLeft}s</>
                ) : (
                  <>
                    {isForgotPassword ? "Havolani yuborish" : isLogin ? "Kirish" : "Ro'yxatdan o'tish"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              {isForgotPassword ? (
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="text-sm text-primary font-medium hover:underline"
                >
                  Kirishga qaytish
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setIsLogin(!isLogin); setIsForgotPassword(false); }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isLogin ? (
                    <>Hisobingiz yo'qmi?{" "}<span className="text-primary font-medium hover:underline">Ro'yxatdan o'ting</span></>
                  ) : (
                    <>Allaqachon hisobingiz bormi?{" "}<span className="text-primary font-medium hover:underline">Kiring</span></>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Back to home */}
          <div className="text-center mt-6">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Bosh sahifaga qaytish
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
