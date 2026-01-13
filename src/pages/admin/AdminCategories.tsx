import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  FolderOpen,
  Layers,
  GripVertical,
  Pencil,
  Trash2,
  Check,
  X,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  is_active: boolean;
  sort_order: number;
}

const defaultEmojis = ["📁", "📂", "🎯", "📢", "📊", "✍️", "📧", "👥", "🌐", "🔍", "📝", "🎬", "🖥️", "🏷️", "🛒", "📨", "🤖", "💡", "⚡", "🔥", "💎", "🚀", "📈", "🎨"];

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [promptCounts, setPromptCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    icon: "📁",
    description: "",
    is_active: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order");
    
    if (error) {
      toast.error("Kategoriyalarni yuklashda xatolik");
      return;
    }
    
    if (data) {
      setCategories(data);
      
      // Fetch prompt counts
      const counts: Record<string, number> = {};
      for (const cat of data) {
        const { count } = await supabase
          .from("prompts")
          .select("id", { count: "exact", head: true })
          .eq("category_id", cat.id)
          .eq("is_published", true);
        counts[cat.id] = count || 0;
      }
      setPromptCounts(counts);
    }
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.slug) {
      toast.error("Nom va slug majburiy");
      return;
    }

    if (editingCategory) {
      // Update
      const { error } = await supabase
        .from("categories")
        .update({
          name: formData.name,
          slug: formData.slug,
          icon: formData.icon,
          description: formData.description,
          is_active: formData.is_active,
        })
        .eq("id", editingCategory.id);

      if (error) {
        toast.error("Xatolik: " + error.message);
        return;
      }
      toast.success("Kategoriya yangilandi");
    } else {
      // Create
      const maxOrder = categories.length > 0 
        ? Math.max(...categories.map(c => c.sort_order)) + 1 
        : 0;
      
      const { error } = await supabase
        .from("categories")
        .insert({
          name: formData.name,
          slug: formData.slug,
          icon: formData.icon,
          description: formData.description,
          is_active: formData.is_active,
          sort_order: maxOrder,
        });

      if (error) {
        toast.error("Xatolik: " + error.message);
        return;
      }
      toast.success("Kategoriya yaratildi");
    }

    setIsDialogOpen(false);
    setEditingCategory(null);
    resetForm();
    fetchCategories();
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      icon: category.icon || "📁",
      description: category.description || "",
      is_active: category.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Kategoriyani o'chirishni xohlaysizmi?")) return;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Xatolik: " + error.message);
      return;
    }

    toast.success("Kategoriya o'chirildi");
    fetchCategories();
    if (selectedCategory?.id === id) {
      setSelectedCategory(null);
    }
  };

  const handleMove = async (category: Category, direction: "up" | "down") => {
    const currentIndex = categories.findIndex(c => c.id === category.id);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const targetCategory = categories[targetIndex];
    
    // Swap sort_order values
    await supabase
      .from("categories")
      .update({ sort_order: targetCategory.sort_order })
      .eq("id", category.id);
    
    await supabase
      .from("categories")
      .update({ sort_order: category.sort_order })
      .eq("id", targetCategory.id);

    fetchCategories();
  };

  const toggleActive = async (category: Category) => {
    const { error } = await supabase
      .from("categories")
      .update({ is_active: !category.is_active })
      .eq("id", category.id);

    if (error) {
      toast.error("Xatolik: " + error.message);
      return;
    }

    fetchCategories();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      icon: "📁",
      description: "",
      is_active: true,
    });
    setEditingCategory(null);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  };

  const isEmoji = (str: string) => {
    const emojiRegex = /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]$/u;
    return emojiRegex.test(str) || str.length <= 2;
  };

  const renderIcon = (icon: string | null) => {
    if (!icon) {
      return <FolderOpen className="w-4 h-4 text-amber-500" />;
    }
    if (isEmoji(icon)) {
      return <span className="text-base">{icon}</span>;
    }
    return <FolderOpen className="w-4 h-4 text-amber-500" />;
  };

  // Calculate total prompts count
  const totalPromptsCount = Object.values(promptCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kategoriyalar</h1>
          <p className="text-muted-foreground">
            Kategoriyalarni boshqaring
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Yangi kategoriya
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Kategoriyani tahrirlash" : "Yangi kategoriya"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {/* Icon Picker */}
              <div className="space-y-2">
                <Label>Emoji tanlang</Label>
                <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg max-h-32 overflow-y-auto">
                  {defaultEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setFormData({ ...formData, icon: emoji })}
                      className={`w-8 h-8 flex items-center justify-center rounded-md text-lg transition-colors ${
                        formData.icon === emoji 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Yoki emoji kiriting..."
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="flex-1"
                  />
                  <div className="w-10 h-10 flex items-center justify-center bg-muted rounded-lg text-xl">
                    {formData.icon}
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label>Nomi</Label>
                <Input
                  placeholder="Google Ads"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData({ 
                      ...formData, 
                      name,
                      slug: editingCategory ? formData.slug : generateSlug(name)
                    });
                  }}
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  placeholder="google-ads"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Tavsif</Label>
                <Textarea
                  placeholder="Kategoriya haqida qisqacha..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>

              {/* Active */}
              <div className="flex items-center justify-between">
                <Label>Faol</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}>
                  Bekor qilish
                </Button>
                <Button className="flex-1" onClick={handleSubmit}>
                  {editingCategory ? "Saqlash" : "Yaratish"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Apple Notes Style Layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden shadow-2xl"
      >
        <div className="flex min-h-[60vh]">
          {/* Left Sidebar - Categories List */}
          <div className="w-72 border-r border-border/50 bg-card/50 flex flex-col">
            {/* Sidebar Header with window controls */}
            <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>

            {/* Label */}
            <div className="px-4 py-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Kategoriyalar ({categories.length})
              </span>
            </div>

            {/* Categories List */}
            <div className="flex-1 overflow-y-auto max-h-[calc(100vh-350px)]">
              {isLoading ? (
                <div className="p-4 space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 bg-muted/50 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <>
                  {/* All categories summary */}
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
                      !selectedCategory 
                        ? "bg-primary/20 text-primary" 
                        : "hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <Layers className="w-4 h-4 text-primary" />
                    <span className="flex-1 text-left text-sm font-medium truncate">
                      Barchasi
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {totalPromptsCount}
                    </span>
                  </button>

                  {categories.map((category, index) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
                        selectedCategory?.id === category.id 
                          ? "bg-primary/20 text-primary" 
                          : "hover:bg-muted/50 text-foreground"
                      } ${!category.is_active ? "opacity-50" : ""}`}
                    >
                      {renderIcon(category.icon)}
                      <span className="flex-1 text-left text-sm font-medium truncate">
                        {category.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {promptCounts[category.id] || 0}
                      </span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Content Header */}
            <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {selectedCategory ? selectedCategory.name : "Barcha kategoriyalar"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedCategory 
                    ? `${promptCounts[selectedCategory.id] || 0} ta promt`
                    : `${categories.length} ta kategoriya`
                  }
                </p>
              </div>
              {selectedCategory && (
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEdit(selectedCategory)}
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Tahrirlash
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleDelete(selectedCategory.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    O'chirish
                  </Button>
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 max-h-[calc(100vh-350px)]">
              {selectedCategory ? (
                // Selected category details
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-6 bg-muted/30 rounded-xl">
                    <div className="w-16 h-16 flex items-center justify-center bg-card rounded-xl text-4xl shadow-lg">
                      {selectedCategory.icon || "📁"}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{selectedCategory.name}</h3>
                      <p className="text-muted-foreground">{selectedCategory.slug}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={selectedCategory.is_active ? "default" : "secondary"}>
                          {selectedCategory.is_active ? "Faol" : "Nofaol"}
                        </Badge>
                        <Badge variant="outline">
                          Tartib: {selectedCategory.sort_order}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {selectedCategory.description && (
                    <div className="p-4 bg-muted/20 rounded-lg">
                      <p className="text-sm text-muted-foreground">{selectedCategory.description}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleMove(selectedCategory, "up")}
                      disabled={categories.findIndex(c => c.id === selectedCategory.id) === 0}
                    >
                      <ArrowUp className="w-4 h-4 mr-1" />
                      Yuqoriga
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleMove(selectedCategory, "down")}
                      disabled={categories.findIndex(c => c.id === selectedCategory.id) === categories.length - 1}
                    >
                      <ArrowDown className="w-4 h-4 mr-1" />
                      Pastga
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleActive(selectedCategory)}
                    >
                      {selectedCategory.is_active ? (
                        <>
                          <X className="w-4 h-4 mr-1" />
                          Nofaol qilish
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Faollashtirish
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                // All categories grid
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category, index) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => setSelectedCategory(category)}
                      className={`cursor-pointer p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-card/80 hover:border-primary/30 transition-all ${
                        !category.is_active ? "opacity-50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 flex items-center justify-center bg-muted rounded-lg text-xl">
                          {category.icon || "📁"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{category.name}</h3>
                          <p className="text-xs text-muted-foreground">{category.slug}</p>
                        </div>
                        <Badge variant="outline" className="shrink-0">
                          {promptCounts[category.id] || 0}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <Badge variant={category.is_active ? "default" : "secondary"}>
                          {category.is_active ? "Faol" : "Nofaol"}
                        </Badge>
                        <span className="text-muted-foreground">
                          Tartib: {category.sort_order}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminCategories;
