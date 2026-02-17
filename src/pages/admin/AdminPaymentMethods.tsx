import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Save, CreditCard, Settings2 } from "lucide-react";
import { toast } from "sonner";

interface PaymentMethod {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  config: Record<string, string | boolean>;
  sort_order: number;
}

const AdminPaymentMethods = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    setIsLoading(true);
    const { data } = await supabase.from("payment_methods").select("*").order("sort_order");
    if (data) setMethods(data as unknown as PaymentMethod[]);
    setIsLoading(false);
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    const { error } = await supabase.from("payment_methods").update({ is_active: !currentActive }).eq("id", id);
    if (error) toast.error("Xatolik");
    else { toast.success(!currentActive ? "Yoqildi" : "O'chirildi"); fetchMethods(); }
  };

  const updateConfig = (id: string, key: string, value: string | boolean) => {
    setMethods(prev => prev.map(m =>
      m.id === id ? { ...m, config: { ...m.config, [key]: value } } : m
    ));
  };

  const saveConfig = async (method: PaymentMethod) => {
    setIsSaving(true);
    const { error } = await supabase.from("payment_methods").update({ config: method.config as any }).eq("id", method.id);
    if (error) toast.error("Xatolik: " + error.message);
    else toast.success(`${method.name} sozlamalari saqlandi`);
    setIsSaving(false);
  };

  const getConfigFields = (slug: string): { key: string; label: string; type: "text" | "password" | "switch" }[] => {
    switch (slug) {
      case "payme":
        return [
          { key: "merchant_id", label: "Merchant ID", type: "text" },
          { key: "secret_key", label: "Secret Key", type: "password" },
          { key: "test_mode", label: "Test rejim", type: "switch" },
        ];
      case "click":
        return [
          { key: "merchant_id", label: "Merchant ID", type: "text" },
          { key: "service_id", label: "Service ID", type: "text" },
          { key: "secret_key", label: "Secret Key", type: "password" },
          { key: "test_mode", label: "Test rejim", type: "switch" },
        ];
      case "manual":
        return [
          { key: "description", label: "Ko'rsatma matni", type: "text" },
        ];
      default:
        return [];
    }
  };

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Yuklanmoqda...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">To'lov usullari</h1>
        <p className="text-muted-foreground">Payme, Click va boshqa to'lov tizimlarini sozlang</p>
      </div>

      <div className="space-y-4">
        {methods.map(method => (
          <div key={method.id} className="bg-card rounded-xl border border-border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{method.name}</h3>
                  <p className="text-xs text-muted-foreground">{method.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={method.is_active ? "default" : "secondary"}>
                  {method.is_active ? "Faol" : "O'chirilgan"}
                </Badge>
                <Switch checked={method.is_active} onCheckedChange={() => toggleActive(method.id, method.is_active)} />
              </div>
            </div>

            {/* Config fields */}
            <div className="space-y-3 pt-2 border-t border-border/50">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Settings2 className="w-4 h-4" /> Sozlamalar
              </h4>
              {getConfigFields(method.slug).map(field => (
                <div key={field.key} className="space-y-1">
                  {field.type === "switch" ? (
                    <div className="flex items-center justify-between">
                      <Label>{field.label}</Label>
                      <Switch checked={!!method.config[field.key]} onCheckedChange={(v) => updateConfig(method.id, field.key, v)} />
                    </div>
                  ) : (
                    <>
                      <Label>{field.label}</Label>
                      <Input
                        type={field.type}
                        value={String(method.config[field.key] || "")}
                        onChange={(e) => updateConfig(method.id, field.key, e.target.value)}
                        placeholder={field.label}
                      />
                    </>
                  )}
                </div>
              ))}
              <Button size="sm" onClick={() => saveConfig(method)} disabled={isSaving}>
                <Save className="w-4 h-4 mr-1" /> Saqlash
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPaymentMethods;
