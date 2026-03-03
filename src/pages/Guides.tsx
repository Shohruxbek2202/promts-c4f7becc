import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Lock, BookOpen, FolderOpen, Layers, Eye } from "lucide-react";
import { SEOHead } from "@/components/seo";

interface Category {
  id: string; name: string; slug: string; icon: string | null;
}

interface Guide {
  id: string; title: string; slug: string; description: string | null;
  is_premium: boolean; price: number; view_count: number;
  cover_image_url: string | null; category_id: string | null;
  categories?: Category;
}

const Guides = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [guideCounts, setGuideCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const selectedCategory = searchParams.get("category") || "";

  useEffect(() => { fetchCategories(); fetchGuides(); }, []);

  const fetchCategories = async () => {
    const [{ data: cats }, { data: allGuides }] = await Promise.all([
      supabase.from("categories").select("id, name, slug, icon").eq("is_active", true).order("sort_order"),
      supabase.from("guides").select("category_id").eq("is_published", true),
    ]);
    if (cats) {
      setCategories(cats);
      const counts: Record<string, number> = {};
      for (const g of allGuides || []) {
        if (g.category_id) counts[g.category_id] = (counts[g.category_id] || 0) + 1;
      }
      setGuideCounts(counts);
    }
  };

  const fetchGuides = async () => {
    setIsLoading(true);
    const { data } = await supabase.from("guides")
      .select(`id, title, slug, description, is_premium, price, view_count, cover_image_url, category_id, categories (id, name, slug, icon)`)
      .eq("is_published", true).order("sort_order").order("created_at", { ascending: false });
    if (data) setGuides(data as Guide[]);
    setIsLoading(false);
  };

  const isEmoji = (str: string) => /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]$/u.test(str) || str.length <= 2;
  const renderIcon = (icon: string | null) => {
    if (icon && isEmoji(icon)) return <span className="text-base">{icon}</span>;
    return <FolderOpen className="w-4 h-4 text-muted-foreground" />;
  };

  const handleCategoryChange = (slug: string) => {
    if (slug === selectedCategory) searchParams.delete("category");
    else searchParams.set("category", slug);
    setSearchParams(searchParams);
  };

  const filteredGuides = guides.filter(g => {
    const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || (g.categories?.slug === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const totalCount = Object.values(guideCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Qo'llanmalar - MPBS.uz" description="AI va marketing bo'yicha qo'llanmalar. PDF, shablonlar va amaliy materiallar." keywords={["qo'llanmalar", "AI", "marketing", "PDF"]} canonicalUrl="https://mpbs.uz/guides" />
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">Qo'llanmalar</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">AI va marketing bo'yicha amaliy qo'llanmalar, shablonlar va materiallar</p>
            </motion.div>

            <div className="relative max-w-md mx-auto mb-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input placeholder="Qo'llanma qidirish..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              <Button variant={!selectedCategory ? "default" : "outline"} size="sm" onClick={() => handleCategoryChange("")} className="rounded-full">
                <Layers className="w-4 h-4 mr-1" />Barchasi ({totalCount})
              </Button>
              {categories.filter(c => guideCounts[c.id]).map(cat => (
                <Button key={cat.id} variant={selectedCategory === cat.slug ? "default" : "outline"} size="sm" onClick={() => handleCategoryChange(cat.slug)} className="rounded-full">
                  {renderIcon(cat.icon)} <span className="ml-1">{cat.name} ({guideCounts[cat.id]})</span>
                </Button>
              ))}
            </div>

            {/* Guides grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-muted/50 rounded-2xl animate-pulse" />)}
              </div>
            ) : filteredGuides.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Qo'llanmalar topilmadi</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGuides.map((guide, i) => (
                  <motion.div key={guide.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link to={`/guides/${guide.slug}`} className="block group">
                      <div className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 transition-all hover:shadow-lg">
                        {guide.cover_image_url && (
                          <div className="aspect-video overflow-hidden">
                            <img src={guide.cover_image_url} alt={guide.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                        )}
                        <div className="p-5">
                          <div className="flex items-center gap-2 mb-3">
                            {guide.categories && <Badge variant="outline" className="text-xs">{guide.categories.name}</Badge>}
                            {guide.is_premium ? (
                              <Badge variant="secondary" className="gap-1 text-xs"><Lock className="w-3 h-3" />{guide.price?.toLocaleString()} so'm</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs text-primary border-primary/30">Bepul</Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">{guide.title}</h3>
                          {guide.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{guide.description}</p>}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Eye className="w-3 h-3" />{guide.view_count} ko'rildi
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Guides;
