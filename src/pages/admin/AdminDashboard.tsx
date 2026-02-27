import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  FileText, 
  CreditCard, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsCharts } from "@/components/admin/StatsCharts";
import ReminderStatsWidget from "@/components/admin/ReminderStatsWidget";
interface Stats {
  totalUsers: number;
  totalPrompts: number;
  pendingPayments: number;
  totalRevenue: number;
}

interface PendingPayment {
  id: string;
  amount: number;
  created_at: string;
  course_id: string | null;
  profiles?: {
    email: string;
    full_name: string;
  };
  pricing_plans?: {
    name: string;
  };
  courses?: {
    title: string;
  };
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalPrompts: 0,
    pendingPayments: 0,
    totalRevenue: 0,
  });
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchPendingPayments();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    const [usersResult, promptsResult, pendingResult, revenueResult] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("prompts").select("id", { count: "exact", head: true }),
      supabase.from("payments").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("payments").select("amount").eq("status", "approved"),
    ]);
    const totalRevenue = revenueResult.data?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;
    setStats({
      totalUsers: usersResult.count || 0,
      totalPrompts: promptsResult.count || 0,
      pendingPayments: pendingResult.count || 0,
      totalRevenue,
    });
    setIsLoading(false);
  };

  const fetchPendingPayments = async () => {
    const { data } = await supabase
      .from("payments")
      .select(`
        id, amount, created_at, course_id,
        profiles!payments_user_id_fkey (email, full_name),
        pricing_plans (name),
        courses (title)
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(5);

    if (data) setPendingPayments(data as unknown as PendingPayment[]);
  };

  // ── Referral commission (same logic as AdminPayments) ──
  const handleReferralCommission = async (userId: string, paymentId: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, referred_by")
      .eq("user_id", userId)
      .maybeSingle();

    if (!profile?.referred_by) return;

    const { data: payment } = await supabase
      .from("payments")
      .select("amount")
      .eq("id", paymentId)
      .maybeSingle();

    if (!payment) return;

    const commissionAmount = Number(payment.amount) * 0.10;
    await supabase.from("referral_transactions").insert({
      referrer_id: profile.referred_by,
      referred_user_id: profile.id,
      payment_id: paymentId,
      amount: commissionAmount,
    });
    const { data: referrer } = await supabase
      .from("profiles")
      .select("referral_earnings")
      .eq("id", profile.referred_by)
      .maybeSingle();
    if (referrer) {
      await supabase.from("profiles")
        .update({ referral_earnings: (referrer.referral_earnings || 0) + commissionAmount })
        .eq("id", profile.referred_by);
    }
  };

  const handlePaymentAction = async (paymentId: string, action: "approved" | "rejected") => {
    const { data: paymentData } = await supabase
      .from("payments")
      .select("user_id, plan_id, course_id, pricing_plans(subscription_type, duration_days)")
      .eq("id", paymentId)
      .maybeSingle();

    const { error } = await supabase
      .from("payments")
      .update({ 
        status: action,
        approved_at: action === "approved" ? new Date().toISOString() : null,
      })
      .eq("id", paymentId);

    if (error) return;

    if (action === "approved") {
      // ── Plan-based payment ──
      if (paymentData?.plan_id) {
        const plan = paymentData.pricing_plans as unknown as { subscription_type: string; duration_days: number | null };
        if (plan) {
          let expiresAt: string | null = null;
          if (plan.duration_days && plan.subscription_type !== "lifetime") {
            const d = new Date();
            d.setDate(d.getDate() + plan.duration_days);
            expiresAt = d.toISOString();
          }
          const validTypes = ["free", "single", "monthly", "yearly", "lifetime", "vip"] as const;
          type SubType = typeof validTypes[number];
          const subType = validTypes.includes(plan.subscription_type as SubType) 
            ? plan.subscription_type as SubType 
            : "free" as SubType;
          await supabase.from("profiles").update({
            subscription_type: subType,
            subscription_expires_at: expiresAt,
            ...(subType === "vip" ? { has_agency_access: true, agency_access_expires_at: expiresAt } : {}),
          }).eq("user_id", paymentData.user_id);
          // ✅ Referral commission credited
          await handleReferralCommission(paymentData.user_id, paymentId);
        }
      }

      // ── Course-based payment ──
      if (paymentData?.course_id) {
        const { error: courseError } = await supabase
          .from("user_courses")
          .insert({
            user_id: paymentData.user_id,
            course_id: paymentData.course_id,
            payment_id: paymentId,
          });
        if (!courseError || courseError.code === "23505") {
          // ✅ Referral commission credited
          await handleReferralCommission(paymentData.user_id, paymentId);
        }
      }

      // ── Email notification ──
      try {
        await supabase.functions.invoke("send-payment-email", { body: { paymentId, action } });
      } catch (e) { console.error("Email notification failed:", e); }
    }

    fetchPendingPayments();
    fetchStats();
  };

  const statCards = [
    { 
      icon: Users, 
      label: "Foydalanuvchilar", 
      value: stats.totalUsers,
      color: "bg-primary/10 text-primary"
    },
    { 
      icon: FileText, 
      label: "Promtlar", 
      value: stats.totalPrompts,
      color: "bg-secondary/50 text-secondary-foreground"
    },
    { 
      icon: CreditCard, 
      label: "Kutilayotgan to'lovlar", 
      value: stats.pendingPayments,
      color: "bg-destructive/10 text-destructive"
    },
    { 
      icon: TrendingUp, 
      label: "Jami daromad", 
      value: `${stats.totalRevenue.toLocaleString()} so'm`,
      color: "bg-primary/10 text-primary"
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Admin panel statistikasi va tezkor amallar
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className="font-display text-2xl font-bold text-foreground">
              {isLoading ? "..." : stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Pending Payments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card rounded-xl border border-border overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-foreground">
                Kutilayotgan to'lovlar
              </h2>
              <p className="text-sm text-muted-foreground">
                Tasdiqlash kerak bo'lgan to'lovlar
              </p>
            </div>
          </div>
          <Link to="/admin/payments">
            <Button variant="outline" size="sm">
              Barchasi
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {pendingPayments.length > 0 ? (
          <div className="divide-y divide-border">
            {pendingPayments.map((payment) => (
              <div key={payment.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    {payment.profiles?.full_name || payment.profiles?.email || "Noma'lum"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {payment.pricing_plans?.name || payment.courses?.title || "—"} — {Number(payment.amount).toLocaleString()} so'm
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(payment.created_at).toLocaleDateString("uz-UZ")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handlePaymentAction(payment.id, "approved")}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Tasdiqlash
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handlePaymentAction(payment.id, "rejected")}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Rad etish
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            Kutilayotgan to'lovlar yo'q
          </div>
        )}
      </motion.div>

      {/* Reminder Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-card rounded-xl border border-border p-6"
      >
        <ReminderStatsWidget />
      </motion.div>

      {/* Stats Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card rounded-xl border border-border p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-foreground">
              Statistika
            </h2>
            <p className="text-sm text-muted-foreground">
              Daromad va to'lovlar tahlili
            </p>
          </div>
        </div>
        <StatsCharts />
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/admin/prompts/new">
          <div className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-colors cursor-pointer group">
            <FileText className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
              Yangi promt qo'shish
            </h3>
            <p className="text-sm text-muted-foreground">
              Bazaga yangi promt qo'shing
            </p>
          </div>
        </Link>
        <Link to="/admin/lessons/new">
          <div className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-colors cursor-pointer group">
            <FileText className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
              Yangi dars qo'shish
            </h3>
            <p className="text-sm text-muted-foreground">
              Video dars qo'shing
            </p>
          </div>
        </Link>
        <Link to="/admin/payments">
          <div className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-colors cursor-pointer group">
            <CreditCard className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
              To'lovlarni ko'rish
            </h3>
            <p className="text-sm text-muted-foreground">
              Barcha to'lovlar tarixi
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
