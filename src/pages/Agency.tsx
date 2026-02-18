import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Search, 
  ChevronRight,
  Sparkles,
  Crown,
  Shield,
  FolderOpen,
  Layers,
  Menu
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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

interface Profile {
  has_agency_access: boolean;
  agency_access_expires_at: string | null;
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

const Agency = () => {
  const { user, isLoading } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [promptCounts, setPromptCounts] = useState<Record<string, number>>({});
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      checkAgencyAccess();
    } else if (!isLoading) {
      setCheckingAccess(false);
    }
  }, [user, isLoading]);

  // Debounce search query 400ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (hasAccess) {
      fetchCategories();
    }
  }, [hasAccess]);

  useEffect(() => {
    if (hasAccess && categories.length > 0) {
      fetchPrompts();
    }
  }, [hasAccess, selectedCategory, categories, debouncedSearch]);

  const checkAgencyAccess = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("has_agency_access, agency_access_expires_at")
      .eq("user_id", user!.id)
      .maybeSingle();

    if (data) {
      const profile = data as Profile;
      const isActive = profile.has_agency_access && 
        (!profile.agency_access_expires_at || 
         new Date(profile.agency_access_expires_at) > new Date());
      setHasAccess(isActive);
    }
    setCheckingAccess(false);
  };

  const fetchCategories = async () => {
    const { data: categoriesData } = await supabase
      .from("categories")
      .select("id, name, slug, icon, description")
      .eq("is_active", true)
      .order("sort_order");
    
    if (categoriesData) {
      setCategories(categoriesData);
      
      // Fetch prompt counts for each category (agency only)
      const counts: Record<string, number> = {};
      for (const cat of categoriesData) {
        const { count } = await supabase
          .from("prompts")
          .select("id", { count: "exact", head: true })
          .eq("category_id", cat.id)
          .eq("is_published", true)
          .eq("is_agency_only", true);
        counts[cat.id] = count || 0;
      }
      setPromptCounts(counts);
    }
  };

  const fetchPrompts = async () => {
    setIsLoadingData(true);
    let query = supabase
      .from("prompts")
      .select(`
        id, title, slug, description, difficulty, is_premium, price, view_count, category_id,
        categories (id, name, slug, icon, description)
      `)
      .eq("is_published", true)
      .eq("is_agency_only", true)
      .order("created_at", { ascending: false });

    if (selectedCategory) {
      const category = categories.find(c => c.slug === selectedCategory);
      if (category) {
        query = query.eq("category_id", category.id);
      }
    }

    // Server-side search
    if (debouncedSearch.trim()) {
      query = query.or(
        `title.ilike.%${debouncedSearch.trim()}%,description.ilike.%${debouncedSearch.trim()}%`
      );
    }

    const { data } = await query;
    if (data) setPrompts(data as Prompt[]);
    setIsLoadingData(false);
  };

  // filteredPrompts is now from server (no client-side filter needed)
  const filteredPrompts = prompts;

  const handleCategoryChange = (slug: string) => {
    if (slug === selectedCategory) {
      setSelectedCategory("");
    } else {
      setSelectedCategory(slug);
    }
    setIsMobileMenuOpen(false);
  };

  const isUrl = (str: string) => {
    return str.startsWith("http://") || str.startsWith("https://");
  };

  const isEmoji = (str: string) => {
    const emojiRegex = /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]$/u;
    return emojiRegex.test(str) || str.length <= 2;
  };

  // Default emoji icons for categories
  const defaultCategoryIcons: Record<string, string> = {
    "google-ads": "🎯",
    "meta-ads": "📢",
    "yandex-direct": "📊",
    "content-marketing": "✍️",
    "email-marketing": "📧",
    "smm-strategy": "👥",
    "seo-prompts": "🌐",
    "analytics": "🔍",
    "copywriting": "📝",
    "video-marketing": "🎬",
    "landing-page": "🖥️",
    "branding": "🏷️",
    "e-commerce": "🛒",
    "telegram-marketing": "📨",
    "ai-tools": "🤖",
  };

  const renderIcon = (icon: string | null, slug?: string) => {
    // First check for emoji icon from database
    if (icon && isEmoji(icon)) {
      return <span className="text-base">{icon}</span>;
    }

    // Check for URL icon
    if (icon && isUrl(icon)) {
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

    // Use default emoji based on slug
    if (slug && defaultCategoryIcons[slug]) {
      return <span className="text-base">{defaultCategoryIcons[slug]}</span>;
    }

    return <FolderOpen className="w-4 h-4 text-amber-500" />;
  };

  // Calculate total prompts count
  const totalPromptsCount = Object.values(promptCounts).reduce((a, b) => a + b, 0);

  // Get current category name
  const currentCategoryName = selectedCategory 
    ? categories.find(c => c.slug === selectedCategory)?.name || "Kategoriya"
    : "Barcha promtlar";

  // Categories sidebar content
  const CategoriesList = () => (
    <div className="flex-1 overflow-y-auto">
      {/* All Prompts */}
      <button
        onClick={() => handleCategoryChange("")}
        className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
          !selectedCategory 
            ? "bg-amber-500/20 text-amber-600 dark:text-amber-400" 
            : "hover:bg-muted/50 text-foreground"
        }`}
      >
        <Layers className="w-4 h-4 text-amber-500" />
        <span className="flex-1 text-left text-sm font-medium truncate">
          Barchasi
        </span>
        <span className="text-xs text-muted-foreground">
          {totalPromptsCount}
        </span>
      </button>

      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleCategoryChange(category.slug)}
          className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
            selectedCategory === category.slug 
              ? "bg-amber-500/20 text-amber-600 dark:text-amber-400" 
              : "hover:bg-muted/50 text-foreground"
          }`}
        >
          {renderIcon(category.icon, category.slug)}
          <span className="flex-1 text-left text-sm font-medium truncate">
            {category.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {promptCounts[category.id] || 0}
          </span>
        </button>
      ))}
    </div>
  );

  if (isLoading || checkingAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass-card p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16 min-h-[80vh] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-auto px-4"
          >
            <div className="glass-card p-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-3">
                Agentlik kirish huquqi
              </h1>
              <p className="text-muted-foreground mb-6">
                Bu bo'limga kirish uchun agentlik obunasiga ega bo'lishingiz kerak. 
                VIP obunasi orqali agentlik promtlariga kirish huquqini oling.
              </p>
              <div className="flex flex-col gap-3">
                <Link to="/#pricing">
                  <Button variant="hero" className="w-full gap-2">
                    <Crown className="w-4 h-4" />
                    VIP obunaga o'tish
                  </Button>
                </Link>
                <Link to="/prompts">
                  <Button variant="outline" className="w-full">
                    Oddiy promtlarga qaytish
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 mb-4">
              <Crown className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                Agentlik Premium
              </span>
            </div>
          </motion.div>

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

          {/* Mobile Category Button */}
          <div className="lg:hidden mb-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full gap-2 border-amber-500/30">
                  <Menu className="w-4 h-4" />
                  {currentCategoryName}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetHeader className="px-4 py-3 border-b border-border/50 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
                  <SheetTitle className="text-left flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-500" />
                    Kategoriyalar
                  </SheetTitle>
                </SheetHeader>
                <CategoriesList />
              </SheetContent>
            </Sheet>
          </div>

          {/* Apple Notes Style Layout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-amber-500/20 bg-card/30 backdrop-blur-sm overflow-hidden shadow-2xl"
          >
            <div className="flex min-h-[70vh]">
              {/* Left Sidebar - Categories (Desktop only) */}
              <div className="hidden lg:flex w-64 border-r border-amber-500/20 bg-card/50 flex-col">
                {/* Sidebar Header with window controls */}
                <div className="px-4 py-3 border-b border-amber-500/20 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>

                {/* Label */}
                <div className="px-4 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Crown className="w-3 h-3" />
                    Agentlik kategoriyalari
                  </span>
                </div>

                {/* Categories List */}
                <CategoriesList />
              </div>

              {/* Right Content Area */}
              <div className="flex-1 flex flex-col">
                {/* Content Header */}
                <div className="px-6 py-4 border-b border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
                  <h1 className="text-xl font-bold text-foreground">
                    {currentCategoryName}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {filteredPrompts.length} ta agentlik promti
                  </p>
                </div>

                {/* Prompts List - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 max-h-[calc(100vh-280px)]">
                  {isLoadingData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="rounded-xl border border-amber-500/20 bg-card/50 p-5 animate-pulse">
                          <div className="h-5 bg-muted rounded mb-3 w-3/4"></div>
                          <div className="h-4 bg-muted rounded mb-2 w-full"></div>
                          <div className="h-4 bg-muted rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : filteredPrompts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-16">
                      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
                        <Sparkles className="w-8 h-8 text-amber-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Agentlik promtlari topilmadi
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Hozircha agentlik promtlari qo'shilmagan. Tez orada qo'shiladi!
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
                            <div className="rounded-xl border border-amber-500/20 bg-card/50 hover:bg-card/80 hover:border-amber-500/40 p-5 h-full flex flex-col transition-all duration-200">
                              {/* Category & Badge */}
                              <div className="flex items-center justify-between mb-3">
                                {prompt.categories && (
                                  <span className="text-xs font-medium text-muted-foreground">
                                    {prompt.categories.name}
                                  </span>
                                )}
                                <Badge className="gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs">
                                  <Crown className="w-3 h-3" />
                                  Agentlik
                                </Badge>
                              </div>

                              {/* Title */}
                              <h3 className="font-semibold text-foreground mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                                {prompt.title}
                              </h3>

                              {/* Description */}
                              <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">
                                {prompt.description}
                              </p>

                              {/* Footer */}
                              <div className="flex items-center justify-between pt-3 border-t border-amber-500/20">
                                <Badge className={`${difficultyColors[prompt.difficulty]} text-xs`}>
                                  {difficultyLabels[prompt.difficulty]}
                                </Badge>
                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
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

export default Agency;