import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Clock, Banknote, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Withdrawal {
  id: string;
  amount: number;
  type: string;
  status: string;
  card_number: string | null;
  card_holder: string | null;
  admin_notes: string | null;
  created_at: string;
  plan_id: string | null;
  profile: {
    email: string | null;
    full_name: string | null;
    referral_earnings: number | null;
  } | null;
  plan: {
    name: string;
    subscription_type: string;
  } | null;
}

const AdminReferralWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adminNote, setAdminNote] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("referral_withdrawals")
      .select("id, amount, type, status, card_number, card_holder, admin_notes, created_at, plan_id, profile_id")
      .order("created_at", { ascending: false });

    if (error) { console.error(error); setIsLoading(false); return; }
    if (!data || data.length === 0) { setWithdrawals([]); setIsLoading(false); return; }

    const profileIds = [...new Set(data.map(d => d.profile_id))];
    const planIds = [...new Set(data.filter(d => d.plan_id).map(d => d.plan_id!))];

    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, email, full_name, referral_earnings")
      .in("id", profileIds);

    let plansData: { id: string; name: string; subscription_type: string }[] = [];
    if (planIds.length > 0) {
      const { data: pd } = await supabase
        .from("pricing_plans")
        .select("id, name, subscription_type")
        .in("id", planIds);
      plansData = pd || [];
    }

    const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
    const plansMap = new Map(plansData.map(p => [p.id, p]));

    const combined = data.map(w => ({
      ...w,
      profile: profilesMap.get(w.profile_id) || null,
      plan: w.plan_id ? plansMap.get(w.plan_id) || null : null,
    }));

    setWithdrawals(combined as unknown as Withdrawal[]);
    setIsLoading(false);
  };

  const handleAction = async (withdrawal: Withdrawal, action: "approved" | "rejected") => {
    setProcessingId(withdrawal.id);
    try {
      const updateData: Record<string, unknown> = {
        status: action,
        admin_notes: adminNote[withdrawal.id] || null,
        approved_at: action === "approved" ? new Date().toISOString() : null,
      };

      const { error: updateError } = await supabase
        .from("referral_withdrawals")
        .update(updateData)
        .eq("id", withdrawal.id);

      if (updateError) throw updateError;

      if (action === "approved") {
        // Find the profile to get user_id for profile updates
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, user_id, referral_earnings")
          .eq("id", (withdrawal as any).profile_id)
          .maybeSingle();

        if (profileData) {
          const currentEarnings = profileData.referral_earnings || 0;
          
          if (withdrawal.type === "subscription" && withdrawal.plan_id) {
            // Apply subscription plan to user
            const { data: plan } = await supabase
              .from("pricing_plans")
              .select("subscription_type, duration_days")
              .eq("id", withdrawal.plan_id)
              .maybeSingle();

            if (plan) {
              let expiresAt: string | null = null;
              if (plan.duration_days && plan.subscription_type !== "lifetime") {
                const expireDate = new Date();
                expireDate.setDate(expireDate.getDate() + plan.duration_days);
                expiresAt = expireDate.toISOString();
              }
              await supabase.from("profiles").update({
                subscription_type: plan.subscription_type,
                subscription_expires_at: expiresAt,
                referral_earnings: Math.max(0, currentEarnings - withdrawal.amount),
              }).eq("id", profileData.id);
            }
          } else {
            // Cash withdrawal — deduct earnings
            await supabase.from("profiles")
              .update({ referral_earnings: Math.max(0, currentEarnings - withdrawal.amount) })
              .eq("id", profileData.id);
          }
        }
        toast.success("So'rov tasdiqlandi");
      } else {
        toast.success("So'rov rad etildi");
      }

      fetchWithdrawals();
    } catch (e) {
      console.error(e);
      toast.error("Xatolik yuz berdi");
    } finally {
      setProcessingId(null);
    }
  };

  const pendingCount = withdrawals.filter(w => w.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Referral so'rovlari
          </h1>
          <p className="text-muted-foreground">Yechib olish va obunaga almashtirish so'rovlari</p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="destructive" className="gap-1 text-base px-3 py-1">
            <Clock className="w-4 h-4" />
            {pendingCount} ta kutilmoqda
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Yuklanmoqda...</div>
      ) : withdrawals.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">So'rovlar yo'q</div>
      ) : (
        <div className="space-y-4">
          {withdrawals.map((w) => (
            <div
              key={w.id}
              className={`bg-card rounded-xl border overflow-hidden ${
                w.status === "pending" ? "border-destructive/30" : "border-border"
              }`}
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      w.type === "cash" ? "bg-secondary/50" : "bg-primary/10"
                    }`}>
                      {w.type === "cash" ? (
                        <Banknote className="w-6 h-6 text-foreground" />
                      ) : (
                        <RefreshCw className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground">
                          {w.profile?.full_name || w.profile?.email || "Noma'lum"}
                        </p>
                        <Badge variant={
                          w.status === "approved" ? "default" :
                          w.status === "rejected" ? "destructive" : "secondary"
                        }>
                          {w.status === "approved" ? "Tasdiqlangan" :
                           w.status === "rejected" ? "Rad etilgan" : "Kutilmoqda"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{w.profile?.email}</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm">
                          <span className="font-medium text-foreground">Tur:</span>{" "}
                          <span className="text-muted-foreground">
                            {w.type === "cash" ? "Naqd yechib olish" : `Obunaga almashtirish — ${w.plan?.name || ""}`}
                          </span>
                        </p>
                        <p className="text-sm">
                          <span className="font-medium text-foreground">Miqdor:</span>{" "}
                          <span className="text-primary font-bold">{w.amount.toLocaleString()} so'm</span>
                        </p>
                        {w.card_number && (
                          <p className="text-sm">
                            <span className="font-medium text-foreground">Karta:</span>{" "}
                            <span className="text-muted-foreground font-mono">{w.card_number}</span>
                            {w.card_holder && <span className="text-muted-foreground"> ({w.card_holder})</span>}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(w.created_at).toLocaleString("uz-UZ")}
                        </p>
                        {w.admin_notes && (
                          <p className="text-xs text-muted-foreground">Admin: {w.admin_notes}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {w.status === "pending" && (
                    <div className="flex flex-col gap-3 min-w-[200px]">
                      <Input
                        placeholder="Admin izohi (ixtiyoriy)"
                        value={adminNote[w.id] || ""}
                        onChange={(e) => setAdminNote(prev => ({ ...prev, [w.id]: e.target.value }))}
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleAction(w, "approved")}
                          disabled={processingId === w.id}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Tasdiqlash
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleAction(w, "rejected")}
                          disabled={processingId === w.id}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Rad
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReferralWithdrawals;
