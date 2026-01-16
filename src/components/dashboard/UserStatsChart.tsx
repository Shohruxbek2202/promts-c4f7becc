import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Eye, 
  Calendar,
  Clock
} from "lucide-react";

interface ViewData {
  date: string;
  views: number;
}

interface SubscriptionInfo {
  type: string;
  expiresAt: string | null;
  daysLeft: number | null;
}

const subscriptionLabels: Record<string, string> = {
  free: "Bepul",
  single: "Bir martalik",
  monthly: "Oylik",
  yearly: "Yillik",
  lifetime: "Umrbod",
  vip: "VIP",
};

const subscriptionColors: Record<string, string> = {
  free: "#94a3b8",
  single: "#3b82f6",
  monthly: "#22c55e",
  yearly: "#a855f7",
  lifetime: "#f59e0b",
  vip: "#ef4444",
};

export const UserStatsChart = () => {
  const { user } = useAuth();
  const [viewData, setViewData] = useState<ViewData[]>([]);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [totalViews, setTotalViews] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      // Fetch user profile for subscription info
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_type, subscription_expires_at")
        .eq("user_id", user!.id)
        .single();

      if (profile) {
        let daysLeft: number | null = null;
        if (profile.subscription_expires_at) {
          const expiresDate = new Date(profile.subscription_expires_at);
          const now = new Date();
          daysLeft = Math.ceil((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (daysLeft < 0) daysLeft = 0;
        }

        setSubscriptionInfo({
          type: profile.subscription_type || "free",
          expiresAt: profile.subscription_expires_at,
          daysLeft,
        });
      }

      // Generate mock view data for demo (in real app, you'd track this in DB)
      const last7Days: ViewData[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push({
          date: date.toLocaleDateString("uz-UZ", { weekday: "short" }),
          views: Math.floor(Math.random() * 15) + 1,
        });
      }
      setViewData(last7Days);
      setTotalViews(last7Days.reduce((sum, d) => sum + d.views, 0));
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-40 bg-muted rounded-lg" />
      </div>
    );
  }

  const pieData = subscriptionInfo ? [
    { name: "Foydalanilgan", value: subscriptionInfo.daysLeft || 0 },
    { name: "Qolgan", value: subscriptionInfo.daysLeft ? 30 - subscriptionInfo.daysLeft : 30 },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Subscription Status Card */}
      <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Obuna holati
          </h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Badge 
                className="text-sm px-3 py-1"
                style={{ 
                  backgroundColor: `${subscriptionColors[subscriptionInfo?.type || 'free']}20`,
                  color: subscriptionColors[subscriptionInfo?.type || 'free']
                }}
              >
                {subscriptionLabels[subscriptionInfo?.type || 'free']}
              </Badge>
              {subscriptionInfo?.expiresAt && subscriptionInfo.daysLeft !== null && (
                <div className="mt-3">
                  <p className="text-sm text-muted-foreground">
                    Tugash sanasi: {new Date(subscriptionInfo.expiresAt).toLocaleDateString("uz-UZ")}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${Math.max(0, Math.min(100, (subscriptionInfo.daysLeft / 30) * 100))}%`,
                          backgroundColor: subscriptionInfo.daysLeft > 7 ? '#22c55e' : subscriptionInfo.daysLeft > 3 ? '#f59e0b' : '#ef4444'
                        }}
                      />
                    </div>
                    <span className={`text-sm font-medium ${
                      subscriptionInfo.daysLeft > 7 ? 'text-green-500' : 
                      subscriptionInfo.daysLeft > 3 ? 'text-amber-500' : 'text-red-500'
                    }`}>
                      {subscriptionInfo.daysLeft} kun qoldi
                    </span>
                  </div>
                </div>
              )}
              {subscriptionInfo?.type === 'lifetime' && (
                <p className="text-sm text-green-500 mt-2 font-medium">
                  Umrbod kirish huquqi ✓
                </p>
              )}
              {subscriptionInfo?.type === 'free' && (
                <p className="text-sm text-muted-foreground mt-2">
                  Premium rejaga o'ting va to'liq kirish oling
                </p>
              )}
            </div>
            {subscriptionInfo?.daysLeft !== null && subscriptionInfo.type !== 'lifetime' && subscriptionInfo.type !== 'free' && (
              <div className="w-24 h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={40}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <Cell fill={subscriptionColors[subscriptionInfo?.type || 'monthly']} />
                      <Cell fill="#e2e8f0" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Faollik
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="w-4 h-4" />
              <span>{totalViews} ta ko'rish</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={viewData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
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
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorViews)"
                  name="Ko'rishlar"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
