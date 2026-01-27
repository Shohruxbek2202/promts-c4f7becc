import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Save, Plus, Trash2, CreditCard, Loader2, Upload, Link as LinkIcon, Image, FolderOpen, Edit2, Mail, Phone, MapPin, Type } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
}

interface PaymentSettings {
  card_number: string;
  card_holder: string;
  instructions: string;
}

interface ContactSettings {
  email: string;
  phone: string;
  address: string;
  telegram_url: string;
  instagram_url: string;
}

interface HeroSettings {
  title: string;
  subtitle: string;
}

interface SectionVisibility {
  show_pricing: boolean;
  show_referral: boolean;
}

const AdminSettings = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [isSavingHero, setIsSavingHero] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "",
  });
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    card_number: "",
    card_holder: "",
    instructions: "",
  });
  const [contactSettings, setContactSettings] = useState<ContactSettings>({
    email: "",
    phone: "",
    address: "",
    telegram_url: "",
    instagram_url: "",
  });
  const [heroSettings, setHeroSettings] = useState<HeroSettings>({
    title: "",
    subtitle: "",
  });
  const [sectionVisibility, setSectionVisibility] = useState<SectionVisibility>({
    show_pricing: true,
    show_referral: true,
  });
  const [isSavingSections, setIsSavingSections] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [iconUrl, setIconUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCategories();
    fetchPaymentSettings();
    fetchContactSettings();
    fetchHeroSettings();
    fetchSectionVisibility();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order");
    
    if (data) setCategories(data as Category[]);
    setIsLoading(false);
  };

  const fetchPaymentSettings = async () => {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "payment_settings")
      .maybeSingle();
    
    if (data?.value) {
      const settings = data.value as unknown as PaymentSettings;
      setPaymentSettings({
        card_number: settings.card_number || "",
        card_holder: settings.card_holder || "",
        instructions: settings.instructions || "",
      });
    }
  };

  const fetchContactSettings = async () => {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "contact_settings")
      .maybeSingle();
    
    if (data?.value) {
      const settings = data.value as unknown as ContactSettings;
      setContactSettings({
        email: settings.email || "",
        phone: settings.phone || "",
        address: settings.address || "",
        telegram_url: settings.telegram_url || "",
        instagram_url: settings.instagram_url || "",
      });
    }
  };

  const fetchHeroSettings = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "hero_text")
      .maybeSingle();
    
    if (data?.value) {
      const settings = data.value as unknown as HeroSettings;
      setHeroSettings({
        title: settings.title || "",
        subtitle: settings.subtitle || "",
      });
    }
  };

  const fetchSectionVisibility = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "section_visibility")
      .maybeSingle();
    
    if (data?.value) {
      const settings = data.value as unknown as SectionVisibility;
      setSectionVisibility({
        show_pricing: settings.show_pricing ?? true,
        show_referral: settings.show_referral ?? true,
      });
    }
  };

  const saveSectionVisibility = async () => {
    setIsSavingSections(true);
    
    const { data: existing } = await supabase
      .from("site_settings")
      .select("id")
      .eq("key", "section_visibility")
      .maybeSingle();

    let error;
    const settingsValue = sectionVisibility as unknown as Json;
    
    if (existing) {
      const result = await supabase
        .from("site_settings")
        .update({ value: settingsValue })
        .eq("key", "section_visibility");
      error = result.error;
    } else {
      const result = await supabase
        .from("site_settings")
        .insert([{ key: "section_visibility", value: settingsValue }]);
      error = result.error;
    }

    if (error) {
      toast.error("Saqlashda xatolik: " + error.message);
    } else {
      toast.success("Bo'lim sozlamalari saqlandi");
    }
    
    setIsSavingSections(false);
  };

  const saveHeroSettings = async () => {
    setIsSavingHero(true);
    
    const { data: existing } = await supabase
      .from("site_settings")
      .select("id")
      .eq("key", "hero_text")
      .maybeSingle();

    let error;
    const settingsValue = heroSettings as unknown as Json;
    
    if (existing) {
      const result = await supabase
        .from("site_settings")
        .update({ value: settingsValue })
        .eq("key", "hero_text");
      error = result.error;
    } else {
      const result = await supabase
        .from("site_settings")
        .insert([{ key: "hero_text", value: settingsValue }]);
      error = result.error;
    }

    if (error) {
      toast.error("Saqlashda xatolik: " + error.message);
    } else {
      toast.success("Hero matni saqlandi");
    }
    
    setIsSavingHero(false);
  };

  const saveContactSettings = async () => {
    setIsSavingContact(true);
    
    const { data: existing } = await supabase
      .from("settings")
      .select("id")
      .eq("key", "contact_settings")
      .maybeSingle();

    let error;
    const settingsValue = contactSettings as unknown as Json;
    
    if (existing) {
      const result = await supabase
        .from("settings")
        .update({ value: settingsValue })
        .eq("key", "contact_settings");
      error = result.error;
    } else {
      const result = await supabase
        .from("settings")
        .insert([{ key: "contact_settings", value: settingsValue }]);
      error = result.error;
    }

    if (error) {
      toast.error("Saqlashda xatolik: " + error.message);
    } else {
      toast.success("Aloqa ma'lumotlari saqlandi");
    }
    
    setIsSavingContact(false);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const uploadIcon = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from("category-icons")
      .upload(fileName, file);

    if (error) {
      toast.error("Rasm yuklashda xatolik: " + error.message);
      setIsUploading(false);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("category-icons")
      .getPublicUrl(fileName);

    setIsUploading(false);
    return urlData.publicUrl;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Faqat rasm fayllari qabul qilinadi");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Fayl hajmi 2MB dan kichik bo'lishi kerak");
      return;
    }

    const url = await uploadIcon(file);
    if (url) {
      if (isEdit && editingCategory) {
        setEditingCategory({ ...editingCategory, icon: url });
      } else {
        setNewCategory(prev => ({ ...prev, icon: url }));
      }
      toast.success("Rasm yuklandi");
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name) {
      toast.error("Kategoriya nomi majburiy");
      return;
    }

    const { error } = await supabase
      .from("categories")
      .insert({
        name: newCategory.name,
        slug: newCategory.slug || generateSlug(newCategory.name),
        description: newCategory.description || null,
        icon: newCategory.icon || null,
        sort_order: categories.length + 1,
      });

    if (error) {
      toast.error("Xatolik: " + error.message);
    } else {
      toast.success("Kategoriya qo'shildi");
      setNewCategory({ name: "", slug: "", description: "", icon: "" });
      fetchCategories();
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    const { error } = await supabase
      .from("categories")
      .update({
        name: editingCategory.name,
        slug: editingCategory.slug,
        description: editingCategory.description,
        icon: editingCategory.icon,
      })
      .eq("id", editingCategory.id);

    if (error) {
      toast.error("Xatolik: " + error.message);
    } else {
      toast.success("Kategoriya yangilandi");
      setEditingCategory(null);
      fetchCategories();
    }
  };

  const toggleCategoryStatus = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from("categories")
      .update({ is_active: !isActive })
      .eq("id", id);

    if (!error) {
      toast.success("Kategoriya yangilandi");
      fetchCategories();
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Bu kategoriyani o'chirmoqchimisiz?")) return;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("O'chirishda xatolik: " + error.message);
    } else {
      toast.success("Kategoriya o'chirildi");
      fetchCategories();
    }
  };

  const savePaymentSettings = async () => {
    setIsSaving(true);
    
    const { data: existing } = await supabase
      .from("settings")
      .select("id")
      .eq("key", "payment_settings")
      .maybeSingle();

    let error;
    const settingsValue = paymentSettings as unknown as Json;
    
    if (existing) {
      const result = await supabase
        .from("settings")
        .update({ value: settingsValue })
        .eq("key", "payment_settings");
      error = result.error;
    } else {
      const result = await supabase
        .from("settings")
        .insert([{ key: "payment_settings", value: settingsValue }]);
      error = result.error;
    }

    if (error) {
      toast.error("Saqlashda xatolik: " + error.message);
    } else {
      toast.success("To'lov sozlamalari saqlandi");
    }
    
    setIsSaving(false);
  };

  const renderIconPreview = (icon: string | null) => {
    if (!icon) {
      return (
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
          <FolderOpen className="w-6 h-6 text-muted-foreground" />
        </div>
      );
    }

    if (icon.startsWith("http://") || icon.startsWith("https://")) {
      return (
        <img 
          src={icon} 
          alt="" 
          className="w-12 h-12 rounded-xl object-cover border border-border"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "";
            (e.target as HTMLImageElement).className = "hidden";
          }}
        />
      );
    }

    return (
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
        {icon}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Sozlamalar
        </h1>
        <p className="text-muted-foreground">
          Platforma sozlamalarini boshqaring
        </p>
      </div>

      {/* Hero Settings */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Type className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Bosh sahifa matni
            </h2>
            <p className="text-sm text-muted-foreground">
              Hero qismidagi sarlavha va tavsif
            </p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Sarlavha</Label>
            <Input 
              placeholder="Marketing promtlari bazasi"
              value={heroSettings.title}
              onChange={(e) => setHeroSettings(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Tavsif</Label>
            <Textarea 
              placeholder="Vaqtingizni tejang, natijalaringizni oshiring."
              rows={2}
              value={heroSettings.subtitle}
              onChange={(e) => setHeroSettings(prev => ({ ...prev, subtitle: e.target.value }))}
            />
          </div>
          <Button onClick={saveHeroSettings} disabled={isSavingHero}>
            {isSavingHero ? (
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

      {/* Section Visibility */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Bo'limlarni ko'rsatish
            </h2>
            <p className="text-sm text-muted-foreground">
              Bosh sahifada qaysi bo'limlar ko'rinishini boshqaring
            </p>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
            <div>
              <p className="font-medium text-foreground">Narxlar bo'limi</p>
              <p className="text-sm text-muted-foreground">
                Bosh sahifada narxlar ko'rinsin (faol narx planlari bo'lsa)
              </p>
            </div>
            <Switch
              checked={sectionVisibility.show_pricing}
              onCheckedChange={(checked) => setSectionVisibility(prev => ({ ...prev, show_pricing: checked }))}
            />
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
            <div>
              <p className="font-medium text-foreground">Referral bo'limi</p>
              <p className="text-sm text-muted-foreground">
                Bosh sahifada referral dasturi ko'rinsin
              </p>
            </div>
            <Switch
              checked={sectionVisibility.show_referral}
              onCheckedChange={(checked) => setSectionVisibility(prev => ({ ...prev, show_referral: checked }))}
            />
          </div>
          <Button onClick={saveSectionVisibility} disabled={isSavingSections}>
            {isSavingSections ? (
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

      {/* Payment Settings */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              To'lov sozlamalari
            </h2>
            <p className="text-sm text-muted-foreground">
              Bank karta ma'lumotlari - foydalanuvchilar ko'radi
            </p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Karta raqami</Label>
              <Input 
                placeholder="8600 0000 0000 0000"
                value={paymentSettings.card_number}
                onChange={(e) => setPaymentSettings(prev => ({ ...prev, card_number: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Karta egasining ismi</Label>
              <Input 
                placeholder="SHOHRUX DIGITAL"
                value={paymentSettings.card_holder}
                onChange={(e) => setPaymentSettings(prev => ({ ...prev, card_holder: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Qo'shimcha ko'rsatmalar</Label>
            <Textarea 
              placeholder="To'lov haqida qo'shimcha ko'rsatmalar..."
              rows={3}
              value={paymentSettings.instructions}
              onChange={(e) => setPaymentSettings(prev => ({ ...prev, instructions: e.target.value }))}
            />
          </div>
          <Button onClick={savePaymentSettings} disabled={isSaving}>
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

      {/* Contact Settings */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
            <Mail className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Aloqa ma'lumotlari
            </h2>
            <p className="text-sm text-muted-foreground">
              Footer va aloqa sahifasida ko'rinadigan ma'lumotlar
            </p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input 
                placeholder="info@example.uz"
                value={contactSettings.email}
                onChange={(e) => setContactSettings(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Telefon
              </Label>
              <Input 
                placeholder="+998 90 123 45 67"
                value={contactSettings.phone}
                onChange={(e) => setContactSettings(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Manzil
            </Label>
            <Input 
              placeholder="Toshkent, O'zbekiston"
              value={contactSettings.address}
              onChange={(e) => setContactSettings(prev => ({ ...prev, address: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Telegram URL</Label>
              <Input 
                placeholder="https://t.me/username"
                value={contactSettings.telegram_url}
                onChange={(e) => setContactSettings(prev => ({ ...prev, telegram_url: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Instagram URL</Label>
              <Input 
                placeholder="https://instagram.com/username"
                value={contactSettings.instagram_url}
                onChange={(e) => setContactSettings(prev => ({ ...prev, instagram_url: e.target.value }))}
              />
            </div>
          </div>
          <Button onClick={saveContactSettings} disabled={isSavingContact}>
            {isSavingContact ? (
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

      {/* Categories Management */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Kategoriyalar
          </h2>
          <p className="text-sm text-muted-foreground">
            Promt kategoriyalarini boshqaring
          </p>
        </div>

        {/* Add New Category */}
        <div className="p-6 border-b border-border bg-muted/30">
          <h3 className="font-medium text-foreground mb-4">Yangi kategoriya qo'shish</h3>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Nomi</Label>
              <Input
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ 
                  ...prev, 
                  name: e.target.value,
                  slug: generateSlug(e.target.value)
                }))}
                placeholder="Kategoriya nomi"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={newCategory.slug}
                onChange={(e) => setNewCategory(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="kategoriya-slug"
              />
            </div>
            <div className="space-y-2">
              <Label>Tavsif</Label>
              <Input
                value={newCategory.description}
                onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Qisqa tavsif"
              />
            </div>
            <div className="space-y-2">
              <Label>Icon (rasm yoki emoji)</Label>
              <div className="flex gap-2">
                <Input
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="🎯 yoki URL"
                  className="flex-1"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, false)}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {newCategory.icon && (
                <div className="flex items-center gap-2 mt-2">
                  {renderIconPreview(newCategory.icon)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNewCategory(prev => ({ ...prev, icon: "" }))}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddCategory} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Qo'shish
              </Button>
            </div>
          </div>
        </div>

        {/* Categories List */}
        <div className="divide-y divide-border">
          {isLoading ? (
            <div className="p-6 text-center text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Yuklanmoqda...
            </div>
          ) : categories.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              Kategoriyalar yo'q
            </div>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {renderIconPreview(category.icon)}
                  <div>
                    <p className="font-medium text-foreground">{category.name}</p>
                    <p className="text-sm text-muted-foreground">/{category.slug}</p>
                    {category.description && (
                      <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`active-${category.id}`} className="text-sm text-muted-foreground">
                      Faol
                    </Label>
                    <Switch
                      id={`active-${category.id}`}
                      checked={category.is_active}
                      onCheckedChange={() => toggleCategoryStatus(category.id, category.is_active)}
                    />
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingCategory(category)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Kategoriyani tahrirlash</DialogTitle>
                        <DialogDescription>
                          Kategoriya ma'lumotlarini o'zgartiring
                        </DialogDescription>
                      </DialogHeader>
                      {editingCategory && (
                        <div className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label>Nomi</Label>
                            <Input
                              value={editingCategory.name}
                              onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Slug</Label>
                            <Input
                              value={editingCategory.slug}
                              onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Tavsif</Label>
                            <Input
                              value={editingCategory.description || ""}
                              onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Icon</Label>
                            <Tabs defaultValue="emoji" className="w-full">
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="emoji">Emoji / URL</TabsTrigger>
                                <TabsTrigger value="upload">Rasm yuklash</TabsTrigger>
                              </TabsList>
                              <TabsContent value="emoji" className="space-y-3">
                                <Input
                                  value={editingCategory.icon || ""}
                                  onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                                  placeholder="🎯 yoki https://..."
                                />
                              </TabsContent>
                              <TabsContent value="upload" className="space-y-3">
                                <input
                                  ref={editFileInputRef}
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleFileChange(e, true)}
                                  className="hidden"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => editFileInputRef.current?.click()}
                                  disabled={isUploading}
                                  className="w-full"
                                >
                                  {isUploading ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Yuklanmoqda...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="w-4 h-4 mr-2" />
                                      Rasm tanlash
                                    </>
                                  )}
                                </Button>
                              </TabsContent>
                            </Tabs>
                            {editingCategory.icon && (
                              <div className="flex items-center gap-3 mt-3">
                                {renderIconPreview(editingCategory.icon)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingCategory({ ...editingCategory, icon: null })}
                                  className="text-red-500 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  O'chirish
                                </Button>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-3 pt-4">
                            <Button onClick={handleUpdateCategory} className="flex-1">
                              <Save className="w-4 h-4 mr-2" />
                              Saqlash
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    onClick={() => deleteCategory(category.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
