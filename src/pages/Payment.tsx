import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Upload, Check, Clock, X, ArrowLeft, Copy } from "lucide-react";
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

const Payment = () => {
  const { user, isLoading } = useAuth();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Bank details - In production, these would come from admin settings
  const bankDetails = {
    bankName: "Example Bank",
    accountName: "PromptHub Inc.",
    accountNumber: "1234567890",
    routingNumber: "021000021",
    swiftCode: "EXAMUS33",
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
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
        toast.error("File size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      setReceiptFile(file);
    }
  };

  const handleSubmitPayment = async () => {
    if (!selectedPlan) {
      toast.error("Please select a plan");
      return;
    }
    if (!receiptFile) {
      toast.error("Please upload your payment receipt");
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

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("receipts")
        .getPublicUrl(fileName);

      // Create payment record
      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          user_id: user!.id,
          plan_id: selectedPlan,
          amount: plan.price,
          status: "pending",
          receipt_url: urlData.publicUrl,
        });

      if (paymentError) throw paymentError;

      toast.success("Payment submitted successfully! We will review and approve shortly.");
      setReceiptFile(null);
      fetchData(); // Refresh payments list
    } catch (error) {
      console.error("Error submitting payment:", error);
      toast.error("Failed to submit payment. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500"><Check className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
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

  const selectedPlanDetails = plans.find(p => p.id === selectedPlan);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary">
            PromptHub
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Make a Payment</h1>
          <p className="text-muted-foreground mt-1">
            Select a plan and submit your payment receipt for approval
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column - Plan Selection & Bank Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Select a Plan</CardTitle>
                <CardDescription>Choose the plan that fits your needs</CardDescription>
              </CardHeader>
              <CardContent>
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
                          className="flex items-center justify-between p-4 border rounded-lg cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted/50 transition-colors"
                        >
                          <div>
                            <p className="font-medium">{plan.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {plan.description}
                            </p>
                            {plan.duration_days && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {plan.duration_days} days access
                              </p>
                            )}
                          </div>
                          <span className="text-xl font-bold text-primary">
                            ${plan.price}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  2. Bank Transfer Details
                </CardTitle>
                <CardDescription>
                  Transfer the amount to the following account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Bank Name</p>
                      <p className="font-medium">{bankDetails.bankName}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankDetails.bankName, "Bank name")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Account Name</p>
                      <p className="font-medium">{bankDetails.accountName}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankDetails.accountName, "Account name")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Account Number</p>
                      <p className="font-mono font-medium">{bankDetails.accountNumber}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankDetails.accountNumber, "Account number")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Routing Number</p>
                      <p className="font-mono font-medium">{bankDetails.routingNumber}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankDetails.routingNumber, "Routing number")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">SWIFT Code</p>
                      <p className="font-mono font-medium">{bankDetails.swiftCode}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankDetails.swiftCode, "SWIFT code")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {selectedPlanDetails && (
                  <div className="bg-primary/10 p-4 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Amount to Transfer</p>
                    <p className="text-3xl font-bold text-primary">
                      ${selectedPlanDetails.price}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Upload & Payment History */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  3. Upload Receipt
                </CardTitle>
                <CardDescription>
                  Upload a screenshot or photo of your payment confirmation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="receipt-upload"
                  />
                  <Label
                    htmlFor="receipt-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    {receiptFile ? (
                      <div>
                        <p className="font-medium text-primary">{receiptFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Click to change file
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium">Click to upload receipt</p>
                        <p className="text-sm text-muted-foreground">
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                    )}
                  </Label>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSubmitPayment}
                  disabled={!selectedPlan || !receiptFile || uploading}
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>Submit Payment Request</>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Your payment will be reviewed and approved within 24 hours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Your recent payment requests</CardDescription>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>No payment history yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{payment.plan?.name || "N/A"}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <span className="font-medium">${payment.amount}</span>
                          {getStatusBadge(payment.status || "pending")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Payment;
