import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Plus, Search, Edit, Trash2, Eye, Lock, Layers, FolderOpen, FileText, BookOpen
} from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

interface Guide {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  is_premium: boolean;
  is_published: boolean;
  price: number;
  view_count: number;
  created_at: string;
  category_id: string | null;
  categories?: Category;
}

const AdminGuides = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [guideCounts, setGuideCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchGuides();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("id, name, slug, icon")
      .order("sort_order");
    if (data) {
      setCategories(data);
      const counts: Record<string, number> = {};
      for (const cat of data) {
        const { count } = await supabase
          .from("guides")
          .select("id", { count: "exact", head: true })
          .eq("category_id", cat.id);
        counts[cat.id] = count || 0;
      }
      setGuideCounts(counts);
    }
  };

  const fetchGuides = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("guides")
      .select(`id, title, slug, description, is_premium, is_published, price, view_count, created_at, category_id, categories (id, name, slug, icon)`)
      .order("created_at", { ascending: false });
    if (data) setGuides(data as Guide[]);
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu qo'llanmani o'chirmoqchimisiz?")) return;
    const { error } = await supabase.from("guides").delete().eq("id", id);
    if (error) {
      toast.error("O'chirishda xatolik yuz berdi");
    } else {
      toast.success("Qo'llanma o'chirildi");
      fetchGuides();
      fetchCategories();
      if (selectedGuide?.id === id) setSelectedGuide(null);
    }
  };

  const togglePublished = async (id: string, current: boolean) => {
    const { error } = await supabase.from("guides").update({ is_published: !current }).eq("id", id);
    if (!error) {
      toast.success(current ? "Qo'llanma yashirildi" : "Qo'llanma nashr etildi");
      fetchGuides();
    }
  };

  const isEmoji = (str: string) => {
    const emojiRegex = /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]$/u;
    return emojiRegex.test(str) || str.length <= 2;
  };

  const renderIcon = (icon: string | null) => {
    if (icon && isEmoji(icon)) return <span className="text-base">{icon}</span>;
    return <FolderOpen className="w-4 h-4 text-amber-500" />;
  };

  const filteredGuides = guides.filter(g => {
    const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || g.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalCount = guides.length;
  const currentCategoryName = selectedCategory
    ? categories.find(c => c.id === selectedCategory)?.name || "Kategoriya"
    : "Barcha qo'llanmalar";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Qo'llanmalar</h1>
          <p className="text-muted-foreground">Barcha qo'llanmalarni boshqaring</p>
        </div>
        <Link to="/admin/guides/new">
          <Button className="gap-2"><Plus className="w-4 h-4" />Yangi qo'llanma</Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input placeholder="Qo'llanma qidirish..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row min-h-[60vh]">
          {/* Categories sidebar */}
          <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-border/50 bg-card/50 flex flex-col">
            <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="px-4 py-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Kategoriyalar ({categories.length})</span>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[200px] lg:max-h-[calc(100vh-400px)] flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-hidden">
              <button onClick={() => { setSelectedCategory(""); setSelectedGuide(null); }}
                className={`flex items-center gap-3 px-4 py-2.5 transition-colors whitespace-nowrap ${!selectedCategory ? "bg-primary/20 text-primary" : "hover:bg-muted/50 text-foreground"}`}>
                <Layers className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Barchasi</span>
                <span className="text-xs text-muted-foreground">{totalCount}</span>
              </button>
              {categories.map(cat => (
                <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); setSelectedGuide(null); }}
                  className={`flex items-center gap-3 px-4 py-2.5 transition-colors whitespace-nowrap ${selectedCategory === cat.id ? "bg-primary/20 text-primary" : "hover:bg-muted/50 text-foreground"}`}>
                  {renderIcon(cat.icon)}
                  <span className="text-sm font-medium truncate">{cat.name}</span>
                  <span className="text-xs text-muted-foreground">{guideCounts[cat.id] || 0}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Guides list */}
          <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-border/50 flex flex-col">
            <div className="px-4 py-3 border-b border-border/50">
              <h2 className="font-semibold text-foreground">{currentCategoryName}</h2>
              <p className="text-xs text-muted-foreground">{filteredGuides.length} ta qo'llanma</p>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[300px] lg:max-h-[calc(100vh-400px)]">
              {isLoading ? (
                <div className="p-4 space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-muted/50 rounded animate-pulse" />)}</div>
              ) : filteredGuides.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Qo'llanmalar topilmadi</p>
                </div>
              ) : filteredGuides.map(guide => (
                <button key={guide.id} onClick={() => setSelectedGuide(guide)}
                  className={`w-full text-left p-4 border-b border-border/30 transition-colors ${selectedGuide?.id === guide.id ? "bg-primary/10" : "hover:bg-muted/30"}`}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-medium text-foreground text-sm line-clamp-1">{guide.title}</h3>
                    {guide.is_premium && <Lock className="w-3 h-3 text-primary shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{guide.description || "Tavsif yo'q"}</p>
                  <div className="flex items-center gap-2">
                    {!guide.is_published && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Yashirin</Badge>}
                    {guide.is_premium && <Badge className="text-[10px] px-1.5 py-0">Premium</Badge>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Detail */}
          <div className="flex-1 flex flex-col">
            {selectedGuide ? (
              <>
                <div className="px-6 py-4 border-b border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{selectedGuide.title}</h2>
                    <p className="text-sm text-muted-foreground">{selectedGuide.categories?.name || "Kategoriyasiz"}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link to={`/guides/${selectedGuide.slug}`}><Button size="sm" variant="outline"><Eye className="w-4 h-4 mr-1" />Ko'rish</Button></Link>
                    <Link to={`/admin/guides/${selectedGuide.id}/edit`}><Button size="sm" variant="outline"><Edit className="w-4 h-4 mr-1" />Tahrirlash</Button></Link>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(selectedGuide.id)}><Trash2 className="w-4 h-4 mr-1" />O'chirish</Button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 max-h-[calc(100vh-400px)]">
                  <div className="p-4 bg-muted/30 rounded-xl mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Status</p>
                        <div className="flex items-center gap-2">
                          <Switch checked={selectedGuide.is_published} onCheckedChange={() => togglePublished(selectedGuide.id, selectedGuide.is_published)} />
                          <span className="text-sm">{selectedGuide.is_published ? "Nashr etilgan" : "Yashirin"}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Turi</p>
                        {selectedGuide.is_premium ? <Badge><Lock className="w-3 h-3 mr-1" />Premium - {selectedGuide.price?.toLocaleString()} so'm</Badge> : <Badge variant="outline">Bepul</Badge>}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Ko'rishlar</p>
                        <span className="text-sm font-medium">{selectedGuide.view_count}</span>
                      </div>
                    </div>
                  </div>
                  {selectedGuide.description && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-foreground mb-2">Tavsif</h3>
                      <p className="text-sm text-muted-foreground">{selectedGuide.description}</p>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Slug: <span className="font-mono">{selectedGuide.slug}</span></p>
                    <p>Yaratilgan: {new Date(selectedGuide.created_at).toLocaleDateString("uz-UZ")}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Qo'llanmani tanlang</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminGuides;
