import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  Loader2,
  CreditCard,
  Crown,
  Star
} from "lucide-react";
import { toast } from "sonner";

interface PricingPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  duration_days: number | null;
  subscription_type: string;
  features: string[];
  is_active: boolean;
  sort_order: number;
}

const subscriptionTypes = [
  { value: "free", label: "Bepul" },
  { value: "single", label: "Bir martalik" },
  { value: "monthly", label: "Oylik" },
  { value: "yearly", label: "Yillik" },
  { value: "lifetime", label: "Umrbod" },
  { value: "vip", label: "VIP" },
];

const AdminPricingPlans = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: 0,
    duration_days: 30,
    subscription_type: "monthly",
    features: "",
    is_active: true,
    sort_order: 0,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("pricing_plans")
      .select("*")
      .order("sort_order");
    
    if (data) {
      setPlans(data.map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features : []
      })) as PricingPlan[]);
    }
    setIsLoading(false);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      price: 0,
      duration_days: 30,
      subscription_type: "monthly",
      features: "",
      is_active: true,
      sort_order: plans.length,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      slug: plan.slug,
      description: plan.description || "",
      price: plan.price,
      duration_days: plan.duration_days || 30,
      subscription_type: plan.subscription_type,
      features: plan.features.join("\n"),
      is_active: plan.is_active,
      sort_order: plan.sort_order,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      toast.error("Nomi va narxi majburiy");
      return;
    }

    setIsSaving(true);
    
    const planData = {
      name: formData.name,
      slug: formData.slug || generateSlug(formData.name),
      description: formData.description || null,
      price: Number(formData.price),
      duration_days: formData.subscription_type === "lifetime" ? null : Number(formData.duration_days),
      subscription_type: formData.subscription_type as "free" | "single" | "monthly" | "yearly" | "lifetime" | "vip",
      features: formData.features.split("\n").filter(f => f.trim()),
      is_active: formData.is_active,
      sort_order: formData.sort_order,
    };

    let error;

    if (editingPlan) {
      const result = await supabase
        .from("pricing_plans")
        .update(planData)
        .eq("id", editingPlan.id);
      error = result.error;
    } else {
      const result = await supabase
        .from("pricing_plans")
        .insert([planData]);
      error = result.error;
    }

    setIsSaving(false);

    if (error) {
      toast.error("Xatolik yuz berdi: " + error.message);
    } else {
      toast.success(editingPlan ? "Tarif yangilandi" : "Tarif yaratildi");
      setIsDialogOpen(false);
      fetchPlans();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu tarifni o'chirmoqchimisiz?")) return;

    const { error } = await supabase
      .from("pricing_plans")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("O'chirishda xatolik: " + error.message);
    } else {
      toast.success("Tarif o'chirildi");
      fetchPlans();
    }
  };

  const toggleStatus = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from("pricing_plans")
      .update({ is_active: !isActive })
      .eq("id", id);

    if (!error) {
      toast.success("Tarif holati yangilandi");
      fetchPlans();
    }
  };

  const getPlanIcon = (type: string) => {
    switch (type) {
      case "vip":
        return <Crown className="w-5 h-5 text-amber-500" />;
      case "lifetime":
        return <Star className="w-5 h-5 text-purple-500" />;
      default:
        return <CreditCard className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Narx tariflari
          </h1>
          <p className="text-muted-foreground">
            Obuna tariflarini boshqaring
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Yangi tarif
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? "Tarifni tahrirlash" : "Yangi tarif yaratish"}
              </DialogTitle>
              <DialogDescription>
                Tarif ma'lumotlarini kiriting
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nomi *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      name: e.target.value,
                      slug: editingPlan ? prev.slug : generateSlug(e.target.value)
                    }))}
                    placeholder="Oylik tarif"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="oylik-tarif"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tavsif</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Tarif haqida qisqa ma'lumot"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Narx (so'm) *</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                    placeholder="99000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Obuna turi</Label>
                  <Select
                    value={formData.subscription_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, subscription_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {subscriptionTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.subscription_type !== "lifetime" && (
                <div className="space-y-2">
                  <Label>Davomiyligi (kun)</Label>
                  <Input
                    type="number"
                    value={formData.duration_days}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_days: Number(e.target.value) }))}
                    placeholder="30"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Xususiyatlar (har bir qator alohida xususiyat)</Label>
                <Textarea
                  value={formData.features}
                  onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))}
                  placeholder="Barcha promtlarga kirish&#10;Premium qo'llab-quvvatlash&#10;Yangilanishlar"
                  rows={4}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <Label>Faol holat</Label>
                  <p className="text-sm text-muted-foreground">
                    Foydalanuvchilarga ko'rinadigan qilish
                  </p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Tartib raqami</Label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, sort_order: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                  Bekor qilish
                </Button>
                <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saqlanmoqda...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Saqlash
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Plans List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            Yuklanmoqda...
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Tariflar yo'q</p>
            <Button onClick={handleOpenCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Birinchi tarifni yarating
            </Button>
          </div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-card rounded-xl border ${plan.is_active ? 'border-border' : 'border-border/50 opacity-60'} overflow-hidden`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      plan.subscription_type === 'vip' ? 'bg-amber-500/10' :
                      plan.subscription_type === 'lifetime' ? 'bg-purple-500/10' :
                      'bg-primary/10'
                    }`}>
                      {getPlanIcon(plan.subscription_type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{plan.name}</h3>
                        <Badge variant={plan.is_active ? "default" : "secondary"}>
                          {plan.is_active ? "Faol" : "Nofaol"}
                        </Badge>
                        <Badge variant="outline">
                          {subscriptionTypes.find(t => t.value === plan.subscription_type)?.label}
                        </Badge>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        {plan.price.toLocaleString()} so'm
                        {plan.duration_days && (
                          <span className="text-sm font-normal text-muted-foreground ml-1">
                            / {plan.duration_days} kun
                          </span>
                        )}
                      </p>
                      {plan.description && (
                        <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                      )}
                      {plan.features.length > 0 && (
                        <ul className="mt-3 space-y-1">
                          {plan.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              {feature}
                            </li>
                          ))}
                          {plan.features.length > 3 && (
                            <li className="text-sm text-muted-foreground">
                              +{plan.features.length - 3} ta xususiyat
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={plan.is_active}
                      onCheckedChange={() => toggleStatus(plan.id, plan.is_active)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(plan)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(plan.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPricingPlans;
