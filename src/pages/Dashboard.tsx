import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  CreditCard, 
  Gift, 
  FileText, 
  Copy, 
  Calendar, 
  ArrowRight,
  Crown,
  Sparkles,
  Building2,
  LogOut,
  BarChart3,
  GraduationCap,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { UserStatsChart } from "@/components/dashboard/UserStatsChart";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  subscription_type: string | null;
  subscription_expires_at: string | null;
  has_agency_access: boolean | null;
  agency_access_expires_at: string | null;
  referral_code: string | null;
  referral_earnings: number | null;
}

interface PurchasedPrompt {
  id: string;
  purchased_at: string;
  prompt: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
  };
}

interface ReferralTransaction {
  id: string;
  amount: number;
  created_at: string;
}

const subscriptionLabels: Record<string, string> = {
  free: "Bepul",
  single: "Bir martalik",
  monthly: "Oylik",
  yearly: "Yillik",
  lifetime: "Umrbod",
  vip: "VIP",
};

const Dashboard = () => {
  const { user, isLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [purchasedPrompts, setPurchasedPrompts] = useState<PurchasedPrompt[]>([]);
  const [purchasedCourses, setPurchasedCourses] = useState<{ id: string; purchased_at: string; course: { id: string; title: string; slug: string; lessons_count: number; cover_image_url: string | null } }[]>([]);
  const [referralTransactions, setReferralTransactions] = useState<ReferralTransaction[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "stats" | "courses" | "prompts" | "referrals">("overview");

  // Subscription expiry warning (7 days)
  const subscriptionExpiryWarning = (() => {
    if (!profile?.subscription_expires_at || profile.subscription_type === "lifetime") return null;
    const expiresAt = new Date(profile.subscription_expires_at);
    const now = new Date();
    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft > 0 && daysLeft <= 7) return daysLeft;
    return null;
  })();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      
      setProfile(profileData);

      const { data: promptsData } = await supabase
        .from("user_prompts")
        .select(`
          id,
          purchased_at,
          prompt:prompts (
            id,
            title,
            slug,
            description
          )
        `)
        .eq("user_id", user!.id)
        .order("purchased_at", { ascending: false });

      if (promptsData) {
        const mappedPrompts = promptsData
          .filter((p): p is typeof p & { prompt: NonNullable<typeof p.prompt> } => p.prompt !== null)
          .map(p => ({
            id: p.id,
            purchased_at: p.purchased_at,
            prompt: Array.isArray(p.prompt) ? p.prompt[0] : p.prompt
          }));
        setPurchasedPrompts(mappedPrompts);
      }

      // Fetch purchased courses
      const { data: coursesData } = await supabase
        .from("user_courses")
        .select(`id, purchased_at, course:courses (id, title, slug, lessons_count, cover_image_url)`)
        .eq("user_id", user!.id)
        .order("purchased_at", { ascending: false });
      if (coursesData) {
        const mapped = coursesData
          .filter((c): c is typeof c & { course: NonNullable<typeof c.course> } => c.course !== null)
          .map(c => ({ id: c.id, purchased_at: c.purchased_at, course: Array.isArray(c.course) ? c.course[0] : c.course }));
        setPurchasedCourses(mapped);
      }

      if (profileData) {
        const { data: referralsData } = await supabase
          .from("referral_transactions")
          .select("id, amount, created_at")
          .eq("referrer_id", profileData.id)
          .order("created_at", { ascending: false });
        
        setReferralTransactions(referralsData || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const copyReferralCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      toast.success("Referral kod nusxalandi!");
    }
  };

  const copyReferralLink = () => {
    if (profile?.referral_code) {
      const link = `${window.location.origin}/auth?ref=${profile.referral_code}`;
      navigator.clipboard.writeText(link);
      toast.success("Referral havola nusxalandi!");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Tizimdan chiqdingiz");
  };

  if (isLoading || loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent hidden sm:inline">
              MPBS.uz
            </span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-3 overflow-x-auto">
            <Link to="/prompts">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">Promtlar</Button>
            </Link>
            {profile?.has_agency_access && (
              <Link to="/agency">
                <Button variant="ghost" size="sm" className="gap-1 text-xs sm:text-sm px-2 sm:px-3">
                  <Building2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Agentlik</span>
                </Button>
              </Link>
            )}
            <Link to="/payment">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">To'lov</Button>
            </Link>
            <Link to="/profile">
              <Button variant="ghost" size="sm" className="gap-1 px-2 sm:px-3">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Profil</span>
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="px-2">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Subscription Expiry Warning Banner */}
        {subscriptionExpiryWarning !== null && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-4"
          >
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
              <p className="font-semibold text-yellow-600 dark:text-yellow-400">
                Obunangiz {subscriptionExpiryWarning} kun ichida tugaydi!
              </p>
              <p className="text-sm text-yellow-600/80 dark:text-yellow-400/80">
                Uzluksiz foydalanish uchun obunani yangilang
              </p>
            </div>
            <Link to="/payment">
              <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white border-0 shrink-0">
                Yangilash
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground">
            Salom, {profile?.full_name || profile?.email?.split("@")[0] || "Foydalanuvchi"}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Shaxsiy kabinetingizga xush kelibsiz
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:border-primary/30 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <Badge variant={profile?.subscription_type === "vip" ? "default" : "secondary"}>
                  {subscriptionLabels[profile?.subscription_type || "free"]}
                </Badge>
              </div>
              <h3 className="text-sm text-muted-foreground">Obuna turi</h3>
              {profile?.subscription_expires_at && (
                <p className="text-xs text-muted-foreground mt-1">
                  Tugaydi: {new Date(profile.subscription_expires_at).toLocaleDateString("uz-UZ")}
                </p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:border-primary/30 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-secondary-foreground" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{purchasedPrompts.length}</p>
              <h3 className="text-sm text-muted-foreground">Sotib olingan promptlar</h3>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:border-primary/30 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-primary" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {((profile?.referral_earnings || 0)).toLocaleString()} so'm
              </p>
              <h3 className="text-sm text-muted-foreground">Referral daromad</h3>
            </div>
          </motion.div>

          {profile?.has_agency_access && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:border-primary/30 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-accent" />
                  </div>
                  <Badge variant="default">Faol</Badge>
                </div>
                <h3 className="text-sm text-muted-foreground">Agentlik kirish</h3>
                {profile?.agency_access_expires_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Tugaydi: {new Date(profile.agency_access_expires_at).toLocaleDateString("uz-UZ")}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: "overview", label: "Umumiy", icon: User },
            { id: "stats", label: "Statistika", icon: BarChart3 },
            { id: "courses", label: "Kurslar", icon: GraduationCap },
            { id: "prompts", label: "Promptlar", icon: FileText },
            { id: "referrals", label: "Referrallar", icon: Gift },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className="gap-2 whitespace-nowrap"
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Referral Code Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
            >
              <div className="p-6 border-b border-border/50">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Gift className="w-5 h-5 text-primary" />
                  Sizning referral kodingiz
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Do'stlaringizni taklif qiling va ularning xaridlaridan 10% komissiya oling
                </p>
              </div>
              <div className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <code className="flex-1 bg-muted/50 px-6 py-3 rounded-xl text-xl font-mono font-bold text-primary text-center sm:text-left">
                    {profile?.referral_code || "N/A"}
                  </code>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={copyReferralCode}>
                      <Copy className="h-4 w-4 mr-2" />
                      Kodni nusxalash
                    </Button>
                    <Button onClick={copyReferralLink}>
                      <Copy className="h-4 w-4 mr-2" />
                      Havolani nusxalash
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Link to="/prompts">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="group p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Promptlarni ko'rish</h3>
                      <p className="text-sm text-muted-foreground">Barcha mavjud promptlarni ko'ring</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </motion.div>
              </Link>
              <Link to="/payment">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="group p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Obunani yangilash</h3>
                      <p className="text-sm text-muted-foreground">Premium rejaga o'tish</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </motion.div>
              </Link>
            </div>
          </div>
        )}

        {activeTab === "stats" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <UserStatsChart />
          </motion.div>
        )}

        {activeTab === "courses" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
            <div className="p-6 border-b border-border/50">
              <h2 className="text-lg font-semibold text-foreground">Sotib olingan kurslar</h2>
              <p className="text-sm text-muted-foreground mt-1">Sizga tegishli barcha kurslar</p>
            </div>
            <div className="p-6">
              {purchasedCourses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">Siz hali hech qanday kurs sotib olmagansiz</p>
                  <Link to="/courses"><Button>Kurslarni ko'rish</Button></Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {purchasedCourses.map((item) => (
                    <Link key={item.id} to={`/course/${item.course.slug}`}>
                      <div className="group rounded-xl border border-border/50 overflow-hidden hover:border-primary/30 transition-all">
                        {item.course.cover_image_url ? (
                          <img src={item.course.cover_image_url} alt={item.course.title} className="w-full h-32 object-cover" />
                        ) : (
                          <div className="w-full h-32 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                            <GraduationCap className="w-8 h-8 text-primary/30" />
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{item.course.title}</h3>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span>{item.course.lessons_count} dars</span>
                            <span>•</span>
                            <span>{new Date(item.purchased_at).toLocaleDateString("uz-UZ")}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "prompts" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
          >
            <div className="p-6 border-b border-border/50">
              <h2 className="text-lg font-semibold text-foreground">Sotib olingan promptlar</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Sizga tegishli barcha promptlar
              </p>
            </div>
            <div className="p-6">
              {purchasedPrompts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Siz hali hech qanday prompt sotib olmagansiz
                  </p>
                  <Link to="/prompts">
                    <Button>Promptlarni ko'rish</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {purchasedPrompts.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">{item.prompt.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {item.prompt.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Sotib olingan: {new Date(item.purchased_at).toLocaleDateString("uz-UZ")}
                        </p>
                      </div>
                      <Link to={`/prompt/${item.prompt.slug}`}>
                        <Button variant="outline" size="sm">
                          Ko'rish
                        </Button>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "referrals" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
            >
              <div className="p-6 border-b border-border/50">
                <h2 className="text-lg font-semibold text-foreground">Referral dasturi</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Do'stlaringizni taklif qilib pul ishlang
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <code className="flex-1 bg-muted/50 px-4 py-3 rounded-xl text-lg font-mono">
                    {profile?.referral_code || "N/A"}
                  </code>
                  <Button variant="outline" size="icon" onClick={copyReferralCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="bg-muted/30 p-4 rounded-xl space-y-2">
                  <h4 className="font-medium text-foreground">Qanday ishlaydi:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center">1</span>
                      Referral kodingizni do'stlaringizga ulashing
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center">2</span>
                      Ular sizning kodingiz orqali ro'yxatdan o'tishadi
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center">3</span>
                      Ularning xaridlaridan 10% komissiya olasiz
                    </li>
                  </ul>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
                  <p className="text-sm text-muted-foreground">Jami daromad</p>
                  <p className="text-4xl font-bold text-primary mt-1">
                    {((profile?.referral_earnings || 0)).toLocaleString()} so'm
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
            >
              <div className="p-6 border-b border-border/50">
                <h2 className="text-lg font-semibold text-foreground">Daromad tarixi</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Sizning komissiya to'lovlaringiz
                </p>
              </div>
              <div className="p-6">
                {referralTransactions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <Gift className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      Hali referral daromadingiz yo'q. Kodingizni ulashishni boshlang!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {referralTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-muted/30"
                      >
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString("uz-UZ")}
                          </p>
                        </div>
                        <span className="font-medium text-green-500">
                          +{transaction.amount.toLocaleString()} so'm
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
