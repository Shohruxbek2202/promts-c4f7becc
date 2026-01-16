import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Filter
} from "lucide-react";
import { toast } from "sonner";

type PaymentStatus = "pending" | "approved" | "rejected";

interface Payment {
  id: string;
  amount: number;
  status: PaymentStatus;
  receipt_url: string | null;
  admin_notes: string | null;
  created_at: string;
  approved_at: string | null;
  profiles?: {
    email: string;
    full_name: string;
  };
  pricing_plans?: {
    name: string;
  };
}

const statusConfig: Record<PaymentStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Kutilmoqda", color: "bg-orange-100 text-orange-700", icon: Clock },
  approved: { label: "Tasdiqlangan", color: "bg-green-100 text-green-700", icon: CheckCircle },
  rejected: { label: "Rad etilgan", color: "bg-red-100 text-red-700", icon: XCircle },
};

const AdminPayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");

  useEffect(() => {
    fetchPayments();

    // Subscribe to realtime payment changes
    const channel = supabase
      .channel('payments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments'
        },
        () => {
          fetchPayments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPayments = async () => {
    setIsLoading(true);
    
    // First get payments
    const { data: paymentsData, error: paymentsError } = await supabase
      .from("payments")
      .select(`
        id, amount, status, receipt_url, admin_notes, created_at, approved_at, user_id, plan_id
      `)
      .order("created_at", { ascending: false });

    if (paymentsError) {
      console.error("Error fetching payments:", paymentsError);
      setIsLoading(false);
      return;
    }

    if (!paymentsData || paymentsData.length === 0) {
      setPayments([]);
      setIsLoading(false);
      return;
    }

    // Get unique user IDs and plan IDs
    const userIds = [...new Set(paymentsData.map(p => p.user_id))];
    const planIds = [...new Set(paymentsData.filter(p => p.plan_id).map(p => p.plan_id))];

    // Fetch profiles for these users
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("user_id, email, full_name")
      .in("user_id", userIds);

    // Fetch pricing plans
    const { data: plansData } = await supabase
      .from("pricing_plans")
      .select("id, name")
      .in("id", planIds);

    // Create lookup maps
    const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
    const plansMap = new Map(plansData?.map(p => [p.id, p]) || []);

    // Combine data
    const combinedPayments = paymentsData.map(payment => ({
      ...payment,
      profiles: profilesMap.get(payment.user_id) || null,
      pricing_plans: plansMap.get(payment.plan_id) || null,
    }));

    setPayments(combinedPayments as unknown as Payment[]);
    setIsLoading(false);
  };

  const handlePaymentAction = async (paymentId: string, action: PaymentStatus, notes?: string) => {
    const updateData: Record<string, unknown> = { 
      status: action,
      admin_notes: notes || null,
    };
    
    if (action === "approved") {
      updateData.approved_at = new Date().toISOString();
    }

    // Get payment details first
    const { data: paymentData } = await supabase
      .from("payments")
      .select("user_id, plan_id, pricing_plans(subscription_type, duration_days)")
      .eq("id", paymentId)
      .single();

    const { error } = await supabase
      .from("payments")
      .update(updateData)
      .eq("id", paymentId);

    if (error) {
      toast.error("Xatolik yuz berdi");
      return;
    }

    // If approved, update user subscription
    if (action === "approved" && paymentData?.plan_id) {
      const plan = paymentData.pricing_plans as unknown as { subscription_type: string; duration_days: number | null };
      
      if (plan) {
        let expiresAt: string | null = null;
        
        // Calculate expiration date based on plan duration
        if (plan.duration_days && plan.subscription_type !== "lifetime") {
          const expireDate = new Date();
          expireDate.setDate(expireDate.getDate() + plan.duration_days);
          expiresAt = expireDate.toISOString();
        }

        // Check if VIP plan to enable agency access
        const isVipPlan = plan.subscription_type === "vip";

        const profileUpdate: Record<string, unknown> = {
          subscription_type: plan.subscription_type,
          subscription_expires_at: expiresAt,
        };

        if (isVipPlan) {
          profileUpdate.has_agency_access = true;
          profileUpdate.agency_access_expires_at = expiresAt;
        }

        const { error: profileError } = await supabase
          .from("profiles")
          .update(profileUpdate)
          .eq("user_id", paymentData.user_id);

        if (profileError) {
          console.error("Error updating profile:", profileError);
          toast.error("To'lov tasdiqlandi, lekin profil yangilanmadi");
        } else {
          // Handle referral commission
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, referred_by")
            .eq("user_id", paymentData.user_id)
            .single();

          if (profile?.referred_by) {
            // Get payment amount for commission calculation (10%)
            const { data: payment } = await supabase
              .from("payments")
              .select("amount")
              .eq("id", paymentId)
              .single();

            if (payment) {
              const commissionAmount = Number(payment.amount) * 0.10;

              // Create referral transaction
              await supabase.from("referral_transactions").insert({
                referrer_id: profile.referred_by,
                referred_user_id: profile.id,
                payment_id: paymentId,
                amount: commissionAmount,
              });

              // Update referrer's earnings
              const { data: referrerProfile } = await supabase
                .from("profiles")
                .select("referral_earnings")
                .eq("id", profile.referred_by)
                .single();
                
              if (referrerProfile) {
                await supabase
                  .from("profiles")
                  .update({ 
                    referral_earnings: (referrerProfile.referral_earnings || 0) + commissionAmount 
                  })
                  .eq("id", profile.referred_by);
              }
            }
          }

          toast.success("To'lov tasdiqlandi va obuna yangilandi");
        }
      }
    } else {
      toast.success(action === "approved" ? "To'lov tasdiqlandi" : "To'lov rad etildi");
    }
    
    fetchPayments();
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const pendingCount = payments.filter(p => p.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            To'lovlar
          </h1>
          <p className="text-muted-foreground">
            Barcha to'lovlarni boshqaring
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="destructive" className="gap-1 text-base px-3 py-1">
            <Clock className="w-4 h-4" />
            {pendingCount} ta kutilmoqda
          </Badge>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Foydalanuvchi qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status === "all" ? "Barchasi" : statusConfig[status].label}
            </Button>
          ))}
        </div>
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Yuklanmoqda...
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            To'lovlar topilmadi
          </div>
        ) : (
          filteredPayments.map((payment) => {
            const StatusIcon = statusConfig[payment.status].icon;
            
            return (
              <div
                key={payment.id}
                className={`bg-card rounded-xl border ${
                  payment.status === "pending" ? "border-orange-200" : "border-border"
                } overflow-hidden`}
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${statusConfig[payment.status].color.split(" ")[0]}`}>
                        <StatusIcon className={`w-6 h-6 ${statusConfig[payment.status].color.split(" ")[1]}`} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {payment.profiles?.full_name || payment.profiles?.email || "Noma'lum"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {payment.profiles?.email}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="font-medium text-foreground">
                            {Number(payment.amount).toLocaleString()} so'm
                          </span>
                          <span className="text-muted-foreground">
                            {payment.pricing_plans?.name}
                          </span>
                          <Badge className={statusConfig[payment.status].color}>
                            {statusConfig[payment.status].label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(payment.created_at).toLocaleString("uz-UZ")}
                          {payment.approved_at && (
                            <> • Tasdiqlangan: {new Date(payment.approved_at).toLocaleString("uz-UZ")}</>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {payment.receipt_url && (
                        <a
                          href={payment.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Chek
                          </Button>
                        </a>
                      )}
                      
                      {payment.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handlePaymentAction(payment.id, "approved")}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Tasdiqlash
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handlePaymentAction(payment.id, "rejected")}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Rad etish
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {payment.admin_notes && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>Admin izoh:</strong> {payment.admin_notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminPayments;
