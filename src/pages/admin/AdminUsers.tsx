import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Shield,
  User,
  MoreHorizontal,
  Mail,
  Calendar
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

type SubscriptionType = "free" | "single" | "monthly" | "yearly" | "lifetime" | "vip";

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  subscription_type: SubscriptionType;
  subscription_expires_at: string | null;
  has_agency_access: boolean;
  referral_earnings: number;
  created_at: string;
}

interface UserRole {
  role: string;
}

const subscriptionLabels: Record<SubscriptionType, string> = {
  free: "Bepul",
  single: "Bir martalik",
  monthly: "Oylik",
  yearly: "Yillik",
  lifetime: "Lifetime",
  vip: "VIP",
};

const AdminUsers = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profiles) {
      setUsers(profiles as Profile[]);
      
      // Fetch roles for all users
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (roles) {
        const rolesMap: Record<string, string[]> = {};
        roles.forEach((r) => {
          if (!rolesMap[r.user_id]) {
            rolesMap[r.user_id] = [];
          }
          rolesMap[r.user_id].push(r.role);
        });
        setUserRoles(rolesMap);
      }
    }
    
    setIsLoading(false);
  };

  const toggleAdminRole = async (userId: string, hasAdmin: boolean) => {
    if (hasAdmin) {
      // Remove admin role
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", "admin");

      if (!error) {
        toast.success("Admin roli olib tashlandi");
        fetchUsers();
      }
    } else {
      // Add admin role
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: "admin" });

      if (!error) {
        toast.success("Admin roli berildi");
        fetchUsers();
      }
    }
  };

  const toggleAgencyAccess = async (userId: string, profileId: string, hasAccess: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ has_agency_access: !hasAccess })
      .eq("id", profileId);

    if (!error) {
      toast.success(hasAccess ? "Agency kirish bekor qilindi" : "Agency kirish berildi");
      fetchUsers();
    }
  };

  const updateSubscription = async (profileId: string, subscriptionType: SubscriptionType) => {
    const { error } = await supabase
      .from("profiles")
      .update({ 
        subscription_type: subscriptionType,
        subscription_expires_at: subscriptionType === "lifetime" || subscriptionType === "free" 
          ? null 
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      .eq("id", profileId);

    if (!error) {
      toast.success("Obuna yangilandi");
      fetchUsers();
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">
          Foydalanuvchilar
        </h1>
        <p className="text-muted-foreground">
          Barcha foydalanuvchilarni boshqaring
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Foydalanuvchi qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                  Foydalanuvchi
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                  Obuna
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                  Rollar
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                  Referral
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                  Ro'yxatdan o'tgan
                </th>
                <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Foydalanuvchilar topilmadi
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roles = userRoles[user.user_id] || [];
                  const isAdmin = roles.includes("admin");
                  
                  return (
                    <tr key={user.id} className="hover:bg-muted/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <User className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {user.full_name || "Noma'lum"}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={user.subscription_type === "free" ? "secondary" : "default"}>
                          {subscriptionLabels[user.subscription_type]}
                        </Badge>
                        {user.has_agency_access && (
                          <Badge variant="outline" className="ml-2">
                            Agency
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {isAdmin && (
                            <Badge variant="destructive" className="gap-1">
                              <Shield className="w-3 h-3" />
                              Admin
                            </Badge>
                          )}
                          {roles.length === 0 && (
                            <span className="text-muted-foreground">User</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {Number(user.referral_earnings || 0).toLocaleString()} so'm
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(user.created_at).toLocaleDateString("uz-UZ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => toggleAdminRole(user.user_id, isAdmin)}
                            >
                              <Shield className="w-4 h-4 mr-2" />
                              {isAdmin ? "Admin rolini olish" : "Admin qilish"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleAgencyAccess(user.user_id, user.id, user.has_agency_access)}
                            >
                              {user.has_agency_access ? "Agency kirishni olish" : "Agency kirish berish"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateSubscription(user.id, "monthly")}
                            >
                              Oylik obuna berish
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateSubscription(user.id, "lifetime")}
                            >
                              Lifetime berish
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateSubscription(user.id, "free")}
                            >
                              Obunani bekor qilish
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
