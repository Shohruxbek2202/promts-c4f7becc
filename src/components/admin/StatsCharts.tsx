import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp } from "lucide-react";

interface PaymentData {
  date: string;
  amount: number;
  count: number;
}

interface SubscriptionData {
  name: string;
  value: number;
}

const COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e"];

export const StatsCharts = () => {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [paymentData, setPaymentData] = useState<PaymentData[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setIsLoading(true);
    
    // Fetch approved payments — get ALL rows with range to avoid 1000-row limit
    const { data: payments } = await supabase
      .from("payments")
      .select("amount, created_at, approved_at")
      .eq("status", "approved")
      .order("created_at", { ascending: true })
      .range(0, 9999);

    if (payments) {
      const groupedData = groupPaymentsByPeriod(payments, period);
      setPaymentData(groupedData);
    }

    // Fetch subscription distribution
    const { data: profiles } = await supabase
      .from("profiles")
      .select("subscription_type");

    if (profiles) {
      const subCounts: Record<string, number> = {};
      profiles.forEach((p) => {
        const type = p.subscription_type || "free";
        subCounts[type] = (subCounts[type] || 0) + 1;
      });

      const subData = Object.entries(subCounts).map(([name, value]) => ({
        name: getSubscriptionLabel(name),
        value,
      }));
      setSubscriptionData(subData);
    }

    setIsLoading(false);
  };

  const groupPaymentsByPeriod = (payments: { amount: number; created_at: string }[], period: string): PaymentData[] => {
    const grouped: Record<string, { amount: number; count: number }> = {};
    
    payments.forEach((payment) => {
      const date = new Date(payment.created_at);
      let key: string;
      
      if (period === "daily") {
        key = date.toLocaleDateString("uz-UZ");
      } else if (period === "weekly") {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toLocaleDateString("uz-UZ");
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      }
      
      if (!grouped[key]) {
        grouped[key] = { amount: 0, count: 0 };
      }
      grouped[key].amount += Number(payment.amount);
      grouped[key].count += 1;
    });

    return Object.entries(grouped)
      .map(([date, data]) => ({ date, ...data }))
      .slice(-10);
  };

  const getSubscriptionLabel = (type: string): string => {
    const labels: Record<string, string> = {
      free: "Bepul",
      single: "Bir martalik",
      monthly: "Oylik",
      yearly: "Yillik",
      lifetime: "Umrbod",
      vip: "VIP",
    };
    return labels[type] || type;
  };

  const totalRevenue = paymentData.reduce((sum, d) => sum + d.amount, 0);
  const totalPayments = paymentData.reduce((sum, d) => sum + d.count, 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-80 bg-muted rounded-xl animate-pulse" />
        <div className="h-80 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center gap-4">
        <Calendar className="w-5 h-5 text-muted-foreground" />
        <div className="flex gap-2">
          {(["daily", "weekly", "monthly"] as const).map((p) => (
            <Button
              key={p}
              size="sm"
              variant={period === p ? "default" : "outline"}
              onClick={() => setPeriod(p)}
            >
              {p === "daily" ? "Kunlik" : p === "weekly" ? "Haftalik" : "Oylik"}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-primary/10 rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Davriy daromad</p>
          <p className="text-2xl font-bold text-foreground">
            {totalRevenue.toLocaleString()} so'm
          </p>
        </div>
        <div className="bg-green-500/10 rounded-xl p-4">
          <p className="text-sm text-muted-foreground">To'lovlar soni</p>
          <p className="text-2xl font-bold text-foreground">
            {totalPayments}
          </p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Daromad dinamikasi</h3>
        </div>
        
        {paymentData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={paymentData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`${value.toLocaleString()} so'm`, "Daromad"]}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorAmount)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Ma'lumotlar yo'q
          </div>
        )}
      </div>

      {/* Subscription Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-foreground mb-6">Obuna taqsimoti</h3>
          
          {subscriptionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={subscriptionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {subscriptionData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              Ma'lumotlar yo'q
            </div>
          )}
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            {subscriptionData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-muted-foreground">
                  {entry.name} ({entry.value})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payments by Count */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-foreground mb-6">To'lovlar soni</h3>
          
          {paymentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={paymentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [value, "To'lovlar"]}
                />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              Ma'lumotlar yo'q
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
