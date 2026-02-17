import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Upload, Check, Clock, X, Copy, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface PricingPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  subscription_type: string;
  duration_days: number | null;
  features: string[];
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  plan: {
    name: string;
  } | null;
}

interface PaymentSettings {
  card_number: string;
  card_holder: string;
  instructions: string;
}

const Payment = () => {
  const { user, isLoading } = useAuth();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    card_number: "8600 0000 0000 0000",
    card_holder: "SHOHRUX DIGITAL",
    instructions: "To'lovni amalga oshirgandan so'ng chekni yuklang",
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch payment settings
      const { data: settingsData } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "payment_settings")
        .maybeSingle();
      
      if (settingsData?.value) {
        const settings = settingsData.value as unknown as PaymentSettings;
        setPaymentSettings({
          card_number: settings.card_number || paymentSettings.card_number,
          card_holder: settings.card_holder || paymentSettings.card_holder,
          instructions: settings.instructions || paymentSettings.instructions,
        });
      }

      // Fetch pricing plans
      const { data: plansData } = await supabase
        .from("pricing_plans")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (plansData) {
        const mappedPlans = plansData.map(plan => ({
          ...plan,
          features: Array.isArray(plan.features) 
            ? plan.features.map(f => String(f))
            : []
        }));
        setPlans(mappedPlans);
        if (mappedPlans.length > 0) {
          setSelectedPlan(mappedPlans[0].id);
        }
      }

      // Fetch user's payment history
      const { data: paymentsData } = await supabase
        .from("payments")
        .select(`
          id,
          amount,
          status,
          created_at,
          plan:pricing_plans (
            name
          )
        `)
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (paymentsData) {
        const mappedPayments = paymentsData.map(p => ({
          ...p,
          plan: Array.isArray(p.plan) ? p.plan[0] : p.plan
        }));
        setPayments(mappedPayments);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Fayl hajmi 5MB dan kichik bo'lishi kerak");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Faqat rasm fayllari qabul qilinadi");
        return;
      }
      setReceiptFile(file);
    }
  };

  const handleSubmitPayment = async () => {
    if (!selectedPlan) {
      toast.error("Iltimos, tarifni tanlang");
      return;
    }
    if (!receiptFile) {
      toast.error("Iltimos, to'lov chekini yuklang");
      return;
    }

    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return;

    setUploading(true);

    try {
      // Upload receipt to storage
      const fileExt = receiptFile.name.split(".").pop();
      const fileName = `${user!.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(fileName, receiptFile);

      if (uploadError) throw uploadError;

      // Create payment record with file path (private bucket)
      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          user_id: user!.id,
          plan_id: selectedPlan,
          amount: plan.price,
          status: "pending",
          receipt_url: fileName,
        });

      if (paymentError) throw paymentError;

      toast.success("To'lov so'rovi yuborildi! Tez orada tasdiqlanadi.");
      setReceiptFile(null);
      fetchData(); // Refresh payments list
    } catch (error) {
      console.error("Error submitting payment:", error);
      toast.error("To'lovni yuborishda xatolik. Qaytadan urinib ko'ring.");
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} nusxalandi!`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/10 text-green-600 border-0"><Check className="h-3 w-3 mr-1" />Tasdiqlangan</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-600 border-0"><X className="h-3 w-3 mr-1" />Rad etilgan</Badge>;
      default:
        return <Badge className="bg-amber-500/10 text-amber-600 border-0"><Clock className="h-3 w-3 mr-1" />Kutilmoqda</Badge>;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
  };

  if (isLoading || loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass-card p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const selectedPlanDetails = plans.find(p => p.id === selectedPlan);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-button mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Premium obuna</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              To'lov sahifasi
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Tarifni tanlang, to'lovni amalga oshiring va chekni yuklang
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left Column - Plan Selection & Bank Details */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6"
              >
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">1</span>
                  Tarifni tanlang
                </h2>
                <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
                  <div className="space-y-3">
                    {plans.map((plan) => (
                      <div key={plan.id} className="relative">
                        <RadioGroupItem
                          value={plan.id}
                          id={plan.id}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={plan.id}
                          className="flex items-center justify-between p-4 rounded-xl cursor-pointer glass-button peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-primary peer-data-[state=checked]:bg-primary/5 transition-all"
                        >
                          <div>
                            <p className="font-semibold text-foreground">{plan.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {plan.description}
                            </p>
                            {plan.duration_days && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {plan.duration_days} kunlik kirish
                              </p>
                            )}
                          </div>
                          <span className="text-xl font-bold text-primary whitespace-nowrap ml-4">
                            {formatPrice(plan.price)}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6"
              >
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">2</span>
                  <CreditCard className="w-5 h-5 text-primary" />
                  Bank kartaga o'tkazish
                </h2>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-xs text-muted-foreground">Karta raqami</p>
                      <p className="font-mono font-semibold text-foreground">{paymentSettings.card_number}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(paymentSettings.card_number.replace(/\s/g, ''), "Karta raqami")}
                      className="rounded-lg"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-xs text-muted-foreground">Karta egasi</p>
                      <p className="font-semibold text-foreground">{paymentSettings.card_holder}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(paymentSettings.card_holder, "Karta egasi")}
                      className="rounded-lg"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  {paymentSettings.instructions && (
                    <p className="text-sm text-muted-foreground p-3 rounded-lg bg-primary/5 border border-primary/10">
                      💡 {paymentSettings.instructions}
                    </p>
                  )}
                </div>

                {selectedPlanDetails && (
                  <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 text-center">
                    <p className="text-sm text-muted-foreground">O'tkazish summasi</p>
                    <p className="text-3xl font-bold text-primary">
                      {formatPrice(selectedPlanDetails.price)}
                    </p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Column - Upload & Payment History */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6"
              >
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">3</span>
                  <Upload className="w-5 h-5 text-primary" />
                  Chekni yuklash
                </h2>
                
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="receipt-upload"
                    />
                    <Label
                      htmlFor="receipt-upload"
                      className="cursor-pointer flex flex-col items-center gap-3"
                    >
                      <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Upload className="h-8 w-8 text-primary" />
                      </div>
                      {receiptFile ? (
                        <div>
                          <p className="font-medium text-primary">{receiptFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Boshqa fayl tanlash uchun bosing
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium text-foreground">Chekni yuklang</p>
                          <p className="text-sm text-muted-foreground">
                            PNG, JPG - 5MB gacha
                          </p>
                        </div>
                      )}
                    </Label>
                  </div>

                  <Button
                    className="w-full h-12 rounded-xl"
                    onClick={handleSubmitPayment}
                    disabled={!selectedPlan || !receiptFile || uploading}
                  >
                    {uploading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Yuklanmoqda...
                      </div>
                    ) : (
                      <>
                        To'lov so'rovini yuborish
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    To'lovingiz 24 soat ichida tasdiqlanadi
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-6"
              >
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  To'lov tarixi
                </h2>
                
                {payments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>Hozircha to'lovlar yo'q</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                      >
                        <div>
                          <p className="font-medium text-foreground">{payment.plan?.name || "N/A"}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(payment.created_at).toLocaleDateString('uz-UZ')}
                          </p>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <span className="font-medium text-foreground">{formatPrice(payment.amount)}</span>
                          {getStatusBadge(payment.status || "pending")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Payment;
