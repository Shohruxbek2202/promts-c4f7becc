import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  Plus, Trash2, Edit2, Save, Loader2, CreditCard, Crown, Star,
  GripVertical, ArrowUp, ArrowDown, Eye, EyeOff, Check
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

// Predefined structured features for checkbox selection
const STRUCTURED_FEATURES = [
  { key: "free_prompts", label: "Bepul promptlarga kirish" },
  { key: "premium_prompts", label: "Premium promptlarga kirish" },
  { key: "agency_prompts", label: "Agentlik promptlariga kirish" },
  { key: "free_lessons", label: "Bepul video darslarga kirish" },
  { key: "premium_lessons", label: "Premium darslarga kirish" },
  { key: "courses_access", label: "Kurslarga kirish" },
  { key: "priority_support", label: "Ustuvor qo'llab-quvvatlash" },
  { key: "updates", label: "Yangilanishlar va qo'shimchalar" },
  { key: "download_materials", label: "Materiallarni yuklab olish" },
  { key: "community_access", label: "Hamjamiyatga kirish" },
];

const AdminPricingPlans = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: 0,
    duration_days: 30,
    subscription_type: "monthly",
    selectedFeatures: [] as string[],
    customFeatures: "",
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
        features: Array.isArray(plan.features) ? plan.features.map(String) : []
      })) as PricingPlan[]);
    }
    setIsLoading(false);
  };

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();

  // Separate structured features from custom ones
  const parseFeatures = (features: string[]) => {
    const structuredLabels = STRUCTURED_FEATURES.map(f => f.label);
    const selected = features.filter(f => structuredLabels.includes(f));
    const custom = features.filter(f => !structuredLabels.includes(f));
    return { selected, custom };
  };

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setFormData({
      name: "", slug: "", description: "", price: 0, duration_days: 30,
      subscription_type: "monthly", selectedFeatures: [], customFeatures: "",
      is_active: true, sort_order: plans.length,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (plan: PricingPlan) => {
    setEditingPlan(plan);
    const { selected, custom } = parseFeatures(plan.features);
    setFormData({
      name: plan.name, slug: plan.slug, description: plan.description || "",
      price: plan.price, duration_days: plan.duration_days || 30,
      subscription_type: plan.subscription_type,
      selectedFeatures: selected,
      customFeatures: custom.join("\n"),
      is_active: plan.is_active, sort_order: plan.sort_order,
    });
    setIsDialogOpen(true);
  };

  const toggleFeature = (label: string) => {
    setFormData(prev => ({
      ...prev,
      selectedFeatures: prev.selectedFeatures.includes(label)
        ? prev.selectedFeatures.filter(f => f !== label)
        : [...prev.selectedFeatures, label],
    }));
  };

  const handleSave = async () => {
    if (!formData.name) { toast.error("Nomi majburiy"); return; }

    setIsSaving(true);

    const allFeatures = [
      ...formData.selectedFeatures,
      ...formData.customFeatures.split("\n").filter(f => f.trim()),
    ];
    
    const planData = {
      name: formData.name,
      slug: formData.slug || generateSlug(formData.name),
      description: formData.description || null,
      price: Number(formData.price),
      duration_days: formData.subscription_type === "lifetime" ? null : Number(formData.duration_days),
      subscription_type: formData.subscription_type as "free" | "single" | "monthly" | "yearly" | "lifetime" | "vip",
      features: allFeatures,
      is_active: formData.is_active,
      sort_order: formData.sort_order,
    };

    const { error } = editingPlan
      ? await supabase.from("pricing_plans").update(planData).eq("id", editingPlan.id)
      : await supabase.from("pricing_plans").insert([planData]);

    setIsSaving(false);

    if (error) {
      toast.error("Xatolik: " + error.message);
    } else {
      toast.success(editingPlan ? "Tarif yangilandi" : "Tarif yaratildi");
      setIsDialogOpen(false);
      fetchPlans();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu tarifni o'chirmoqchimisiz?")) return;
    const { error } = await supabase.from("pricing_plans").delete().eq("id", id);
    if (error) toast.error("Xatolik: " + error.message);
    else { toast.success("Tarif o'chirildi"); fetchPlans(); }
  };

  const toggleStatus = async (id: string, currentActive: boolean) => {
    setTogglingId(id);
    const { error } = await supabase
      .from("pricing_plans")
      .update({ is_active: !currentActive })
      .eq("id", id);

    if (error) {
      toast.error("Holatni o'zgartirishda xatolik: " + error.message);
    } else {
      toast.success(!currentActive ? "Tarif faollashtirildi" : "Tarif o'chirildi");
      setPlans(prev => prev.map(p => p.id === id ? { ...p, is_active: !currentActive } : p));
    }
    setTogglingId(null);
  };

  const moveOrder = async (planId: string, direction: "up" | "down") => {
    const idx = plans.findIndex(p => p.id === planId);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= plans.length) return;

    const updates = [
      { id: plans[idx].id, sort_order: plans[swapIdx].sort_order },
      { id: plans[swapIdx].id, sort_order: plans[idx].sort_order },
    ];

    await Promise.all(
      updates.map(u => supabase.from("pricing_plans").update({ sort_order: u.sort_order }).eq("id", u.id))
    );

    fetchPlans();
    toast.success("Tartib yangilandi");
  };

  const getPlanIcon = (type: string) => {
    switch (type) {
      case "vip": return <Crown className="w-5 h-5 text-amber-500" />;
      case "lifetime": return <Star className="w-5 h-5 text-purple-500" />;
      default: return <CreditCard className="w-5 h-5 text-primary" />;
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
            Obuna tariflarini boshqaring — xususiyatlarni yoqing/o'chiring
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreate}>
              <Plus className="w-4 h-4 mr-2" /> Yangi tarif
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPlan ? "Tarifni tahrirlash" : "Yangi tarif yaratish"}</DialogTitle>
              <DialogDescription>Tarif ma'lumotlarini kiriting</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nomi *</Label>
                  <Input value={formData.name} onChange={e => setFormData(prev => ({
                    ...prev, name: e.target.value,
                    slug: editingPlan ? prev.slug : generateSlug(e.target.value)
                  }))} placeholder="Oylik tarif" />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={formData.slug} onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))} placeholder="oylik-tarif" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tavsif</Label>
                <Textarea value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Tarif haqida qisqa ma'lumot" rows={2} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Narx (so'm) *</Label>
                  <Input type="number" value={formData.price} onChange={e => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))} />
                </div>
                <div className="space-y-2">
                  <Label>Obuna turi</Label>
                  <Select value={formData.subscription_type} onValueChange={v => setFormData(prev => ({ ...prev, subscription_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {subscriptionTypes.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.subscription_type !== "lifetime" && (
                <div className="space-y-2">
                  <Label>Davomiyligi (kun)</Label>
                  <Input type="number" value={formData.duration_days} onChange={e => setFormData(prev => ({ ...prev, duration_days: Number(e.target.value) }))} />
                </div>
              )}

              {/* Structured Feature Toggles */}
              <div className="space-y-3">
                <Label>Xususiyatlar (yoqish/o'chirish)</Label>
                <div className="border border-border rounded-lg divide-y divide-border">
                  {STRUCTURED_FEATURES.map(feat => {
                    const isChecked = formData.selectedFeatures.includes(feat.label);
                    return (
                      <label
                        key={feat.key}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 cursor-pointer transition-colors"
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleFeature(feat.label)}
                        />
                        <span className={`text-sm ${isChecked ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                          {feat.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Custom features (free text) */}
              <div className="space-y-2">
                <Label>Qo'shimcha xususiyatlar (har bir qator alohida)</Label>
                <Textarea
                  value={formData.customFeatures}
                  onChange={e => setFormData(prev => ({ ...prev, customFeatures: e.target.value }))}
                  placeholder="24/7 chat support&#10;API kirish imkoniyati"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <Label>Faol holat</Label>
                  <p className="text-sm text-muted-foreground">Foydalanuvchilarga ko'rinadi</p>
                </div>
                <Switch checked={formData.is_active} onCheckedChange={checked => setFormData(prev => ({ ...prev, is_active: checked }))} />
              </div>

              <div className="space-y-2">
                <Label>Tartib raqami</Label>
                <Input type="number" value={formData.sort_order} onChange={e => setFormData(prev => ({ ...prev, sort_order: Number(e.target.value) }))} />
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>Bekor qilish</Button>
                <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saqlanmoqda...</> : <><Save className="w-4 h-4 mr-2" />Saqlash</>}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Plans List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />Yuklanmoqda...
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Tariflar yo'q</p>
            <Button onClick={handleOpenCreate}><Plus className="w-4 h-4 mr-2" />Birinchi tarifni yarating</Button>
          </div>
        ) : (
          plans.map((plan, idx) => (
            <div
              key={plan.id}
              className={`bg-card rounded-xl border transition-all ${
                plan.is_active ? "border-border" : "border-border/40 opacity-50"
              }`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Order Controls */}
                    <div className="flex flex-col gap-0.5 pt-1">
                      <Button
                        variant="ghost" size="icon"
                        className="h-6 w-6"
                        disabled={idx === 0}
                        onClick={() => moveOrder(plan.id, "up")}
                      >
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                      <div className="flex items-center justify-center h-6 w-6">
                        <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <Button
                        variant="ghost" size="icon"
                        className="h-6 w-6"
                        disabled={idx === plans.length - 1}
                        onClick={() => moveOrder(plan.id, "down")}
                      >
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Plan Icon */}
                    <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center ${
                      plan.subscription_type === "vip" ? "bg-amber-500/10" :
                      plan.subscription_type === "lifetime" ? "bg-purple-500/10" : "bg-primary/10"
                    }`}>
                      {getPlanIcon(plan.subscription_type)}
                    </div>

                    {/* Plan Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-foreground">{plan.name}</h3>
                        <Badge variant={plan.is_active ? "default" : "secondary"} className="text-xs">
                          {plan.is_active ? <><Eye className="w-3 h-3 mr-1" />Faol</> : <><EyeOff className="w-3 h-3 mr-1" />Nofaol</>}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {subscriptionTypes.find(t => t.value === plan.subscription_type)?.label}
                        </Badge>
                      </div>
                      <p className="text-xl font-bold text-primary">
                        {plan.price.toLocaleString()} so'm
                        {plan.duration_days && (
                          <span className="text-sm font-normal text-muted-foreground ml-1">/ {plan.duration_days} kun</span>
                        )}
                      </p>
                      {plan.description && (
                        <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                      )}
                      {plan.features.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {plan.features.map((f, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-xs text-muted-foreground">
                              <Check className="w-3 h-3 text-primary" />{f}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Switch
                      checked={plan.is_active}
                      disabled={togglingId === plan.id}
                      onCheckedChange={() => toggleStatus(plan.id, plan.is_active)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(plan)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(plan.id)}>
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
