import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Lock, 
  ChevronRight,
  Sparkles,
  FolderOpen,
  Layers,
  MoreHorizontal,
  PenSquare
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

  const renderIcon = (icon: string | null) => {
    if (!icon) {
      return <FolderOpen className="w-4 h-4 text-amber-500" />;
    }

    if (isUrl(icon)) {
      return (
        <img 
          src={icon} 
          alt="" 
          className="w-5 h-5 object-contain rounded"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      );
    }

    if (isEmoji(icon)) {
      return <span className="text-base">{icon}</span>;
    }

    return <FolderOpen className="w-4 h-4 text-amber-500" />;
  };

  // Calculate total prompts count
  const totalPromptsCount = Object.values(promptCounts).reduce((a, b) => a + b, 0);

  // Get current category name
  const currentCategoryName = selectedCategory 
    ? categories.find(c => c.slug === selectedCategory)?.name || "Kategoriya"
    : "Barcha promtlar";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Search Bar */}
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

          {/* Apple Notes Style Layout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden shadow-2xl"
          >
            <div className="flex min-h-[70vh]">
              {/* Left Sidebar - Categories */}
              <div className="w-64 border-r border-border/50 bg-card/50 flex flex-col">
                {/* Sidebar Header with window controls */}
                <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>

                {/* iCloud Label */}
                <div className="px-4 py-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Kategoriyalar
                  </span>
                </div>

                {/* Categories List */}
                <div className="flex-1 overflow-y-auto">
                  {/* All Prompts */}
                  <button
                    onClick={() => handleCategoryChange("")}
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
                      onClick={() => handleCategoryChange(category.slug)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
                        selectedCategory === category.slug 
                          ? "bg-primary/20 text-primary" 
                          : "hover:bg-muted/50 text-foreground"
                      }`}
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
                </div>
              </div>

              {/* Right Content Area */}
              <div className="flex-1 flex flex-col">
                {/* Content Header */}
                <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-bold text-foreground">
                      {currentCategoryName}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {filteredPrompts.length} ta promt
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <PenSquare className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Prompts List */}
                <div className="flex-1 overflow-y-auto p-6">
                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="rounded-xl border border-border/50 bg-card/50 p-5 animate-pulse">
                          <div className="h-5 bg-muted rounded mb-3 w-3/4"></div>
                          <div className="h-4 bg-muted rounded mb-2 w-full"></div>
                          <div className="h-4 bg-muted rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : filteredPrompts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-16">
                      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                        <Sparkles className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Promtlar topilmadi
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Boshqa kategoriya yoki kalit so'z bilan qidirib ko'ring
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredPrompts.map((prompt, index) => (
                        <motion.div
                          key={prompt.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                        >
                          <Link 
                            to={`/prompt/${prompt.slug}`} 
                            className="group block h-full"
                          >
                            <div className="rounded-xl border border-border/50 bg-card/50 hover:bg-card/80 hover:border-primary/30 p-5 h-full flex flex-col transition-all duration-200">
                              {/* Category & Badge */}
                              <div className="flex items-center justify-between mb-3">
                                {prompt.categories && (
                                  <span className="text-xs font-medium text-muted-foreground">
                                    {prompt.categories.name}
                                  </span>
                                )}
                                {prompt.is_premium ? (
                                  <Badge className="gap-1 bg-primary/10 text-primary border-0 text-xs">
                                    <Lock className="w-3 h-3" />
                                    Premium
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-green-600 border-green-200 dark:border-green-800 text-xs">
                                    Bepul
                                  </Badge>
                                )}
                              </div>

                              {/* Title */}
                              <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
                                {prompt.title}
                              </h3>

                              {/* Description */}
                              <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">
                                {prompt.description}
                              </p>

                              {/* Footer */}
                              <div className="flex items-center justify-between pt-3 border-t border-border/30">
                                <Badge className={`${difficultyColors[prompt.difficulty]} text-xs`}>
                                  {difficultyLabels[prompt.difficulty]}
                                </Badge>
                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Prompts;