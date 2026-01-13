import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Save, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
}

const AdminSettings = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "",
  });

  useEffect(() => {
    fetchCategories();
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

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
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
        description: newCategory.description,
        icon: newCategory.icon,
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">
          Sozlamalar
        </h1>
        <p className="text-muted-foreground">
          Platforma sozlamalarini boshqaring
        </p>
      </div>

      {/* Categories Management */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Kategoriyalar
          </h2>
          <p className="text-sm text-muted-foreground">
            Promt kategoriyalarini boshqaring
          </p>
        </div>

        {/* Add New Category */}
        <div className="p-6 border-b border-border bg-muted/30">
          <h3 className="font-medium text-foreground mb-4">Yangi kategoriya qo'shish</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
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
            <div>
              <Label>Slug</Label>
              <Input
                value={newCategory.slug}
                onChange={(e) => setNewCategory(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="kategoriya-slug"
              />
            </div>
            <div>
              <Label>Icon</Label>
              <Input
                value={newCategory.icon}
                onChange={(e) => setNewCategory(prev => ({ ...prev, icon: e.target.value }))}
                placeholder="Icon nomi"
              />
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
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    category.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    <span className="text-lg">{category.icon || "📁"}</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{category.name}</p>
                    <p className="text-sm text-muted-foreground">/{category.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
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

      {/* Payment Settings */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="font-display text-lg font-semibold text-foreground">
            To'lov sozlamalari
          </h2>
          <p className="text-sm text-muted-foreground">
            To'lov qabul qilish uchun karta ma'lumotlari
          </p>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Karta raqami</Label>
            <Input placeholder="8600 0000 0000 0000" />
          </div>
          <div className="space-y-2">
            <Label>Karta egasining ismi</Label>
            <Input placeholder="SHOHRUX DIGITAL" />
          </div>
          <div className="space-y-2">
            <Label>Qo'shimcha ma'lumot</Label>
            <Textarea 
              placeholder="To'lov haqida qo'shimcha ko'rsatmalar..."
              rows={3}
            />
          </div>
          <Button variant="hero">
            <Save className="w-4 h-4 mr-2" />
            Saqlash
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
