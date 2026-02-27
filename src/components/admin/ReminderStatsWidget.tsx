import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Clock, AlertTriangle, XCircle, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";

interface ReminderSummary {
  sent_today: number;
  sent_this_week: number;
  count_7_days: number;
  count_3_days: number;
  count_1_day: number;
  count_expired: number;
}

const ReminderStatsWidget = () => {
  const [summary, setSummary] = useState<ReminderSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      const { data, error } = await supabase.rpc("get_reminder_summary");
      if (!error && data) setSummary(data as unknown as ReminderSummary);
      setIsLoading(false);
    };
    fetchSummary();
  }, []);

  const cards = [
    {
      icon: CalendarDays,
      label: "7 kunlik",
      value: summary?.count_7_days ?? 0,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      icon: Clock,
      label: "3 kunlik",
      value: summary?.count_3_days ?? 0,
      color: "bg-amber-500/10 text-amber-600",
    },
    {
      icon: AlertTriangle,
      label: "1 kunlik",
      value: summary?.count_1_day ?? 0,
      color: "bg-orange-500/10 text-orange-600",
    },
    {
      icon: XCircle,
      label: "Expired",
      value: summary?.count_expired ?? 0,
      color: "bg-destructive/10 text-destructive",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold text-foreground">
            Obuna eslatmalari
          </h3>
        </div>
        <div className="flex gap-3 text-sm text-muted-foreground">
          <span>Bugun: <strong className="text-foreground">{summary?.sent_today ?? 0}</strong></span>
          <span>Hafta: <strong className="text-foreground">{summary?.sent_this_week ?? 0}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-lg border border-border bg-card p-4"
          >
            <div className={`w-9 h-9 rounded-md ${card.color} flex items-center justify-center mb-2`}>
              <card.icon className="w-4 h-4" />
            </div>
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className="text-xl font-bold text-foreground">
              {isLoading ? "..." : card.value}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ReminderStatsWidget;
