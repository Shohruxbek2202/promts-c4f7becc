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
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  profiles?: {
    email: string;
    full_name: string;
  };
  pricing_plans?: {
    name: string;
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
    
    // Fetch counts
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
        id, amount, created_at,
        profiles!payments_user_id_fkey (email, full_name),
        pricing_plans (name)
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(5);

    if (data) setPendingPayments(data as unknown as PendingPayment[]);
  };

  const handlePaymentAction = async (paymentId: string, action: "approved" | "rejected") => {
    const { error } = await supabase
      .from("payments")
      .update({ 
        status: action,
        approved_at: action === "approved" ? new Date().toISOString() : null,
      })
      .eq("id", paymentId);

    if (!error) {
      fetchPendingPayments();
      fetchStats();
    }
  };

  const statCards = [
    { 
      icon: Users, 
      label: "Foydalanuvchilar", 
      value: stats.totalUsers,
      color: "bg-blue-500/10 text-blue-600"
    },
    { 
      icon: FileText, 
      label: "Promtlar", 
      value: stats.totalPrompts,
      color: "bg-green-500/10 text-green-600"
    },
    { 
      icon: CreditCard, 
      label: "Kutilayotgan to'lovlar", 
      value: stats.pendingPayments,
      color: "bg-orange-500/10 text-orange-600"
    },
    { 
      icon: TrendingUp, 
      label: "Jami daromad", 
      value: `${stats.totalRevenue.toLocaleString()} so'm`,
      color: "bg-purple-500/10 text-purple-600"
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
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
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
                    {payment.pricing_plans?.name} - {Number(payment.amount).toLocaleString()} so'm
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(payment.created_at).toLocaleDateString("uz-UZ")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 hover:bg-green-50"
                    onClick={() => handlePaymentAction(payment.id, "approved")}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Tasdiqlash
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
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
        <Link to="/admin/users">
          <div className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-colors cursor-pointer group">
            <Users className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
              Foydalanuvchilarni boshqarish
            </h3>
            <p className="text-sm text-muted-foreground">
              Foydalanuvchilar ro'yxatini ko'ring
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
