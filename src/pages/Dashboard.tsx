import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, CreditCard, Gift, FileText, Copy, Calendar, ArrowRight } from "lucide-react";
import { toast } from "sonner";

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

const Dashboard = () => {
  const { user, isLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [purchasedPrompts, setPurchasedPrompts] = useState<PurchasedPrompt[]>([]);
  const [referralTransactions, setReferralTransactions] = useState<ReferralTransaction[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      
      setProfile(profileData);

      // Fetch purchased prompts
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

      // Fetch referral transactions if profile exists
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
      toast.success("Referral code copied!");
    }
  };

  const getSubscriptionBadge = (type: string | null) => {
    const badges: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      free: { variant: "outline", label: "Free" },
      single: { variant: "secondary", label: "Single Purchase" },
      monthly: { variant: "default", label: "Monthly" },
      yearly: { variant: "default", label: "Yearly" },
      lifetime: { variant: "default", label: "Lifetime" },
      vip: { variant: "default", label: "VIP" },
    };
    const badge = badges[type || "free"] || badges.free;
    return <Badge variant={badge.variant}>{badge.label}</Badge>;
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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary">
            PromptHub
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/prompts">
              <Button variant="ghost">Browse Prompts</Button>
            </Link>
            <Link to="/payment">
              <Button variant="outline">Make Payment</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account, subscriptions, and prompts
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="prompts">Prompts</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Subscription</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {getSubscriptionBadge(profile?.subscription_type)}
                  </div>
                  {profile?.subscription_expires_at && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Expires: {new Date(profile.subscription_expires_at).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Purchased Prompts</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{purchasedPrompts.length}</div>
                  <p className="text-xs text-muted-foreground">prompts owned</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Referral Earnings</CardTitle>
                  <Gift className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${(profile?.referral_earnings || 0).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">total earned</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Agency Access</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <Badge variant={profile?.has_agency_access ? "default" : "outline"}>
                    {profile?.has_agency_access ? "Active" : "Not Active"}
                  </Badge>
                  {profile?.agency_access_expires_at && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Expires: {new Date(profile.agency_access_expires_at).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Your Referral Code</CardTitle>
                <CardDescription>
                  Share this code with friends and earn commissions on their purchases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <code className="bg-muted px-4 py-2 rounded-lg text-lg font-mono">
                    {profile?.referral_code || "N/A"}
                  </code>
                  <Button variant="outline" size="sm" onClick={copyReferralCode}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Link to="/prompts">
                <Button>
                  Browse Prompts
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link to="/payment">
                <Button variant="outline">
                  Upgrade Subscription
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="prompts">
            <Card>
              <CardHeader>
                <CardTitle>Purchased Prompts</CardTitle>
                <CardDescription>
                  All prompts you have purchased or have access to
                </CardDescription>
              </CardHeader>
              <CardContent>
                {purchasedPrompts.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      You haven't purchased any prompts yet
                    </p>
                    <Link to="/prompts">
                      <Button>Browse Prompts</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {purchasedPrompts.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">{item.prompt.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {item.prompt.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            Purchased: {new Date(item.purchased_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Link to={`/prompt/${item.prompt.slug}`}>
                          <Button variant="outline" size="sm">
                            View Prompt
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrals">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Referral Program</CardTitle>
                  <CardDescription>
                    Earn commissions by referring new users
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <code className="bg-muted px-4 py-2 rounded-lg text-lg font-mono flex-1">
                      {profile?.referral_code || "N/A"}
                    </code>
                    <Button variant="outline" size="sm" onClick={copyReferralCode}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">How it works:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Share your referral code with friends</li>
                      <li>• They sign up using your code</li>
                      <li>• You earn 10% commission on their purchases</li>
                      <li>• Earnings are credited to your account</li>
                    </ul>
                  </div>
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Earnings</p>
                    <p className="text-3xl font-bold text-primary">
                      ${(profile?.referral_earnings || 0).toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Referral History</CardTitle>
                  <CardDescription>Your commission earnings</CardDescription>
                </CardHeader>
                <CardContent>
                  {referralTransactions.length === 0 ? (
                    <div className="text-center py-8">
                      <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No referral earnings yet. Share your code to start earning!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {referralTransactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="font-medium text-green-600">
                            +${transaction.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Billing & Subscription</CardTitle>
                <CardDescription>
                  Manage your subscription and payment history
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Current Plan</h4>
                    <div className="flex items-center gap-2 mt-1">
                      {getSubscriptionBadge(profile?.subscription_type)}
                      {profile?.subscription_expires_at && (
                        <span className="text-sm text-muted-foreground">
                          (expires {new Date(profile.subscription_expires_at).toLocaleDateString()})
                        </span>
                      )}
                    </div>
                  </div>
                  <Link to="/payment">
                    <Button>Upgrade Plan</Button>
                  </Link>
                </div>

                {profile?.has_agency_access && (
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/5">
                    <div>
                      <h4 className="font-medium">Agency Access</h4>
                      <p className="text-sm text-muted-foreground">
                        Full access to agency-only prompts
                        {profile.agency_access_expires_at && (
                          <> until {new Date(profile.agency_access_expires_at).toLocaleDateString()}</>
                        )}
                      </p>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                )}

                <div className="text-center py-4">
                  <Link to="/payment">
                    <Button variant="outline">
                      View Payment History & Make Payment
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
