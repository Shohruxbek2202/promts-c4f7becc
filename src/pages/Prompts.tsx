import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Lock, 
  ChevronRight,
  Sparkles,
  FolderOpen,
  Layers
} from "lucide-react";

type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "expert";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
}

interface Prompt {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: DifficultyLevel;
  is_premium: boolean;
  price: number;
  view_count: number;
  category_id: string;
  categories?: Category;
}

const difficultyColors: Record<DifficultyLevel, string> = {
  beginner: "bg-green-500/10 text-green-600 dark:text-green-400",
  intermediate: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  advanced: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  expert: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const difficultyLabels: Record<DifficultyLevel, string> = {
  beginner: "Boshlang'ich",
  intermediate: "O'rta",
  advanced: "Ilg'or",
  expert: "Ekspert",
};

// Gradient colors for category icons
const gradientColors = [
  "from-blue-500/20 to-blue-600/10",
  "from-indigo-500/20 to-indigo-600/10",
  "from-red-500/20 to-red-600/10",
  "from-emerald-500/20 to-emerald-600/10",
  "from-amber-500/20 to-amber-600/10",
  "from-pink-500/20 to-pink-600/10",
  "from-cyan-500/20 to-cyan-600/10",
  "from-violet-500/20 to-violet-600/10",
  "from-orange-500/20 to-orange-600/10",
  "from-teal-500/20 to-teal-600/10",
];

const Prompts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [promptCounts, setPromptCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const selectedCategory = searchParams.get("category") || "";

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      fetchPrompts();
    }
  }, [selectedCategory, categories]);

  const fetchCategories = async () => {
    const { data: categoriesData } = await supabase
      .from("categories")
      .select("id, name, slug, icon, description")
      .eq("is_active", true)
      .order("sort_order");
    
    if (categoriesData) {
      setCategories(categoriesData);
      
      // Fetch prompt counts for each category
      const counts: Record<string, number> = {};
      for (const cat of categoriesData) {
        const { count } = await supabase
          .from("prompts")
          .select("id", { count: "exact", head: true })
          .eq("category_id", cat.id)
          .eq("is_published", true)
          .eq("is_agency_only", false);
        counts[cat.id] = count || 0;
      }
      setPromptCounts(counts);
    }
  };

  const fetchPrompts = async () => {
    setIsLoading(true);
    let query = supabase
      .from("prompts")
      .select(`
        id, title, slug, description, difficulty, is_premium, price, view_count, category_id,
        categories (id, name, slug, icon, description)
      `)
      .eq("is_published", true)
      .eq("is_agency_only", false)
      .order("created_at", { ascending: false });

    if (selectedCategory) {
      const category = categories.find(c => c.slug === selectedCategory);
      if (category) {
        query = query.eq("category_id", category.id);
      }
    }

    const { data } = await query;
    if (data) setPrompts(data as Prompt[]);
    setIsLoading(false);
  };

  const filteredPrompts = prompts.filter(prompt =>
    prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prompt.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCategoryChange = (slug: string) => {
    if (slug === selectedCategory) {
      searchParams.delete("category");
    } else {
      searchParams.set("category", slug);
    }
    setSearchParams(searchParams);
  };

  const isUrl = (str: string) => {
    return str.startsWith("http://") || str.startsWith("https://");
  };

  const isEmoji = (str: string) => {
    const emojiRegex = /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]$/u;
    return emojiRegex.test(str) || str.length <= 2;
  };

  const renderIcon = (icon: string | null, index: number) => {
    if (!icon) {
      return <FolderOpen className="w-5 h-5 text-primary" />;
    }

    if (isUrl(icon)) {
      return (
        <img 
          src={icon} 
          alt="" 
          className="w-6 h-6 object-contain rounded"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      );
    }

    if (isEmoji(icon)) {
      return <span className="text-xl">{icon}</span>;
    }

    return <FolderOpen className="w-5 h-5 text-primary" />;
  };

  // Calculate total prompts count
  const totalPromptsCount = Object.values(promptCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-4">
              Promtlar bazasi
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {totalPromptsCount.toLocaleString()}+ professional marketing promtlari. Kerakli promtni toping va ishlating.
            </p>
          </motion.div>

          {/* Search */}
          <div className="relative max-w-xl mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Promt qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-full glass-button border-0"
            />
          </div>

          {/* Main Content - Sidebar + Grid */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Categories Sidebar - Apple Notes Style */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-80 flex-shrink-0"
            >
              <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden shadow-lg sticky top-24">
                {/* Header */}
                <div className="px-4 py-3 border-b border-border/50 bg-muted/30">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span className="ml-3 text-sm font-medium text-muted-foreground">Kategoriyalar</span>
                  </div>
                </div>

                {/* Categories List */}
                <div className="divide-y divide-border/30 max-h-[60vh] overflow-y-auto">
                  {/* All Categories Button */}
                  <button
                    onClick={() => handleCategoryChange("")}
                    className={`w-full group flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-all duration-200 ${
                      !selectedCategory ? "bg-primary/10" : ""
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 ${
                      !selectedCategory ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                    }`}>
                      <Layers className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <h3 className={`font-medium truncate ${!selectedCategory ? "text-primary" : "text-foreground"}`}>
                        Barchasi
                      </h3>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                      {totalPromptsCount}
                    </span>
                  </button>

                  {categories.map((category, index) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.slug)}
                      className={`w-full group flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-all duration-200 ${
                        selectedCategory === category.slug ? "bg-primary/10" : ""
                      }`}
                    >
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradientColors[index % gradientColors.length]} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300 ${
                        selectedCategory === category.slug ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                      }`}>
                        {renderIcon(category.icon, index)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 text-left min-w-0">
                        <h3 className={`font-medium truncate transition-colors ${
                          selectedCategory === category.slug ? "text-primary" : "text-foreground group-hover:text-primary"
                        }`}>
                          {category.name}
                        </h3>
                      </div>

                      {/* Count */}
                      <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                        {promptCounts[category.id] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Prompts Grid */}
            <div className="flex-1 min-w-0">
              {/* Results Count */}
              <p className="text-sm text-muted-foreground mb-6">
                {filteredPrompts.length} ta promt topildi
                {selectedCategory && categories.find(c => c.slug === selectedCategory) && (
                  <span className="ml-2 text-primary font-medium">
                    — {categories.find(c => c.slug === selectedCategory)?.name}
                  </span>
                )}
              </p>

              {/* Prompts Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="glass-card p-6 animate-pulse">
                      <div className="h-6 bg-muted rounded-lg mb-3 w-3/4"></div>
                      <div className="h-4 bg-muted rounded-lg mb-2 w-full"></div>
                      <div className="h-4 bg-muted rounded-lg w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredPrompts.map((prompt, index) => (
                    <motion.div
                      key={prompt.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Link to={`/prompt/${prompt.slug}`} className="group block h-full">
                        <div className="glass-card p-6 h-full flex flex-col hover:border-primary/30 transition-all duration-300">
                          {/* Category & Premium Badge */}
                          <div className="flex items-center justify-between mb-3">
                            {prompt.categories && (
                              <span className="text-xs font-medium text-muted-foreground">
                                {prompt.categories.name}
                              </span>
                            )}
                            {prompt.is_premium ? (
                              <Badge className="gap-1 bg-primary/10 text-primary border-0">
                                <Lock className="w-3 h-3" />
                                Premium
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-green-600 border-green-200 dark:border-green-800">
                                Bepul
                              </Badge>
                            )}
                          </div>

                          {/* Title */}
                          <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                            {prompt.title}
                          </h3>

                          {/* Description */}
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">
                            {prompt.description}
                          </p>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-4 border-t border-border/50">
                            <Badge className={difficultyColors[prompt.difficulty]}>
                              {difficultyLabels[prompt.difficulty]}
                            </Badge>
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!isLoading && filteredPrompts.length === 0 && (
                <div className="text-center py-16">
                  <div className="glass-card w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Promtlar topilmadi
                  </h3>
                  <p className="text-muted-foreground">
                    Boshqa kalit so'z bilan qidirib ko'ring
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Prompts;