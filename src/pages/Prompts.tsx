import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Lock, 
  Sparkles,
  FolderOpen,
  Layers,
  Menu,
  Copy,
  Eye,
  CheckCircle,
  ArrowLeft
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

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
  content: string;
  instructions: string | null;
  examples: string | null;
  difficulty: DifficultyLevel;
  is_premium: boolean;
  price: number;
  view_count: number;
  copy_count: number;
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

interface Profile {
  subscription_type: string | null;
}

const Prompts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [promptCounts, setPromptCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  
  const selectedCategory = searchParams.get("category") || "";

  // Check if user has premium access
  const hasPremiumAccess = profile?.subscription_type && 
    ['monthly', 'yearly', 'lifetime', 'vip'].includes(profile.subscription_type);

  useEffect(() => {
    fetchCategories();
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("subscription_type")
      .eq("user_id", user.id)
      .single();
    if (data) setProfile(data);
  };

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
        id, title, slug, description, content, instructions, examples, 
        difficulty, is_premium, price, view_count, copy_count, category_id,
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
    if (data) {
      setPrompts(data as Prompt[]);
      // Auto-select first prompt if none selected
      if (data.length > 0 && !selectedPrompt) {
        setSelectedPrompt(data[0] as Prompt);
      }
    }
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
    setIsMobileMenuOpen(false);
    setSelectedPrompt(null);
  };

  const handleCopyPrompt = async () => {
    if (!selectedPrompt) return;
    
    // Check access
    if (selectedPrompt.is_premium && !hasPremiumAccess) {
      toast({
        title: "Premium kontent",
        description: "Bu promtni nusxalash uchun premium obuna kerak",
        variant: "destructive",
      });
      navigate("/payment");
      return;
    }

    try {
      await navigator.clipboard.writeText(selectedPrompt.content);
      setCopied(true);
      
      // Update copy count
      await supabase
        .from("prompts")
        .update({ copy_count: (selectedPrompt.copy_count || 0) + 1 })
        .eq("id", selectedPrompt.id);
      
      toast({
        title: "Nusxalandi!",
        description: "Promt buferga nusxalandi",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "Nusxalashda xatolik yuz berdi",
        variant: "destructive",
      });
    }
  };

  const isUrl = (str: string) => {
    return str.startsWith("http://") || str.startsWith("https://");
  };

  const isEmoji = (str: string) => {
    const emojiRegex = /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]$/u;
    return emojiRegex.test(str) || str.length <= 2;
  };

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
    if (icon && isEmoji(icon)) {
      return <span className="text-base">{icon}</span>;
    }

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

    if (slug && defaultCategoryIcons[slug]) {
      return <span className="text-base">{defaultCategoryIcons[slug]}</span>;
    }

    return <FolderOpen className="w-4 h-4 text-amber-500" />;
  };

  const totalPromptsCount = Object.values(promptCounts).reduce((a, b) => a + b, 0);

  const currentCategoryName = selectedCategory 
    ? categories.find(c => c.slug === selectedCategory)?.name || "Kategoriya"
    : "Barcha promtlar";

  const CategoriesList = () => (
    <div className="flex-1 overflow-y-auto">
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

      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleCategoryChange(category.slug)}
          className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
            selectedCategory === category.slug 
              ? "bg-primary/20 text-primary" 
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto mb-6">
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
                <Button variant="outline" className="w-full gap-2">
                  <Menu className="w-4 h-4" />
                  {currentCategoryName}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetHeader className="px-4 py-3 border-b border-border/50">
                  <SheetTitle className="text-left">Kategoriyalar</SheetTitle>
                </SheetHeader>
                <CategoriesList />
              </SheetContent>
            </Sheet>
          </div>

          {/* Apple Notes Style 3-Column Layout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden shadow-2xl"
          >
            <div className="flex h-[75vh]">
              {/* Column 1: Categories (Desktop only) */}
              <div className="hidden lg:flex w-56 border-r border-border/50 bg-card/50 flex-col flex-shrink-0">
                <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>

                <div className="px-4 py-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Kategoriyalar
                  </span>
                </div>

                <ScrollArea className="flex-1">
                  <CategoriesList />
                </ScrollArea>
              </div>

              {/* Column 2: Prompts List */}
              <div className="w-full lg:w-80 border-r border-border/50 bg-card/30 flex flex-col flex-shrink-0">
                <div className="px-4 py-3 border-b border-border/50">
                  <h2 className="font-semibold text-foreground">{currentCategoryName}</h2>
                  <p className="text-xs text-muted-foreground">{filteredPrompts.length} ta promt</p>
                </div>

                <ScrollArea className="flex-1">
                  {isLoading ? (
                    <div className="p-4 space-y-3">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="p-3 rounded-lg bg-muted/30 animate-pulse">
                          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-full"></div>
                        </div>
                      ))}
                    </div>
                  ) : filteredPrompts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                      <Sparkles className="w-8 h-8 text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground">Promtlar topilmadi</p>
                    </div>
                  ) : (
                    <div className="p-2 space-y-1">
                      {filteredPrompts.map((prompt) => (
                        <button
                          key={prompt.id}
                          onClick={() => setSelectedPrompt(prompt)}
                          className={`w-full text-left p-3 rounded-lg transition-all ${
                            selectedPrompt?.id === prompt.id
                              ? "bg-primary/20 border border-primary/30"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-medium text-sm text-foreground line-clamp-1">
                              {prompt.title}
                            </h3>
                            {prompt.is_premium ? (
                              <Lock className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            ) : (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-green-600 border-green-600/30">
                                Bepul
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {prompt.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={`${difficultyColors[prompt.difficulty]} text-[10px] px-1.5 py-0`}>
                              {difficultyLabels[prompt.difficulty]}
                            </Badge>
                            {prompt.categories && (
                              <span className="text-[10px] text-muted-foreground">
                                {prompt.categories.name}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Column 3: Prompt Detail */}
              <div className="hidden lg:flex flex-1 flex-col bg-background/50">
                {selectedPrompt ? (
                  <>
                    {/* Detail Header */}
                    <div className="px-6 py-4 border-b border-border/50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {selectedPrompt.categories && (
                              <Badge variant="outline" className="text-xs">
                                {selectedPrompt.categories.name}
                              </Badge>
                            )}
                            {selectedPrompt.is_premium ? (
                              <Badge className="gap-1 bg-primary/10 text-primary border-0 text-xs">
                                <Lock className="w-3 h-3" />
                                Premium
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-green-600 border-green-600/30 text-xs">
                                Bepul
                              </Badge>
                            )}
                            <Badge className={`${difficultyColors[selectedPrompt.difficulty]} text-xs`}>
                              {difficultyLabels[selectedPrompt.difficulty]}
                            </Badge>
                          </div>
                          <h1 className="text-xl font-bold text-foreground">
                            {selectedPrompt.title}
                          </h1>
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedPrompt.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {selectedPrompt.view_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Copy className="w-3.5 h-3.5" />
                            {selectedPrompt.copy_count || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Prompt Content */}
                    <ScrollArea className="flex-1 p-6">
                      <div className="space-y-6">
                        {/* Prompt Text */}
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            Promt matni
                          </h3>
                          <div className="relative">
                            {selectedPrompt.is_premium && !hasPremiumAccess ? (
                              <div className="rounded-xl bg-muted/50 border border-border/50 p-6 text-center">
                                <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                                <h4 className="font-semibold text-foreground mb-2">Premium kontent</h4>
                                <p className="text-sm text-muted-foreground mb-4">
                                  Bu promtni ko'rish uchun premium obunaga o'ting
                                </p>
                                <Button onClick={() => navigate("/payment")}>
                                  Premium olish
                                </Button>
                              </div>
                            ) : (
                              <div className="rounded-xl bg-muted/30 border border-border/50 p-4">
                                <pre className="whitespace-pre-wrap text-sm text-foreground font-mono leading-relaxed">
                                  {selectedPrompt.content}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Instructions */}
                        {selectedPrompt.instructions && (!selectedPrompt.is_premium || hasPremiumAccess) && (
                          <div>
                            <h3 className="text-sm font-semibold text-foreground mb-3">
                              📋 Qo'llanma
                            </h3>
                            <div className="rounded-xl bg-blue-500/5 border border-blue-500/20 p-4">
                              <p className="text-sm text-foreground whitespace-pre-wrap">
                                {selectedPrompt.instructions}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Examples */}
                        {selectedPrompt.examples && (!selectedPrompt.is_premium || hasPremiumAccess) && (
                          <div>
                            <h3 className="text-sm font-semibold text-foreground mb-3">
                              💡 Misollar
                            </h3>
                            <div className="rounded-xl bg-green-500/5 border border-green-500/20 p-4">
                              <p className="text-sm text-foreground whitespace-pre-wrap">
                                {selectedPrompt.examples}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>

                    {/* Copy Button */}
                    <div className="px-6 py-4 border-t border-border/50">
                      <Button
                        onClick={handleCopyPrompt}
                        className="w-full gap-2"
                        disabled={copied}
                      >
                        {copied ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Nusxalandi!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Promtni nusxalash
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-center p-6">
                    <div>
                      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">
                        Promtni tanlang
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Chap tomondagi ro'yxatdan promtni tanlang
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Prompt Detail - shown as overlay when prompt is selected */}
              {selectedPrompt && (
                <div className="lg:hidden fixed inset-0 z-50 bg-background">
                  <div className="flex flex-col h-full">
                    {/* Mobile Header */}
                    <div className="px-4 py-3 border-b border-border/50 flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedPrompt(null)}
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </Button>
                      <div className="flex-1">
                        <h2 className="font-semibold text-foreground line-clamp-1">
                          {selectedPrompt.title}
                        </h2>
                      </div>
                    </div>

                    {/* Mobile Content */}
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          {selectedPrompt.categories && (
                            <Badge variant="outline" className="text-xs">
                              {selectedPrompt.categories.name}
                            </Badge>
                          )}
                          {selectedPrompt.is_premium ? (
                            <Badge className="gap-1 bg-primary/10 text-primary border-0 text-xs">
                              <Lock className="w-3 h-3" />
                              Premium
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-green-600 border-green-600/30 text-xs">
                              Bepul
                            </Badge>
                          )}
                          <Badge className={`${difficultyColors[selectedPrompt.difficulty]} text-xs`}>
                            {difficultyLabels[selectedPrompt.difficulty]}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {selectedPrompt.description}
                        </p>

                        {/* Prompt Content */}
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-2">
                            Promt matni
                          </h3>
                          {selectedPrompt.is_premium && !hasPremiumAccess ? (
                            <div className="rounded-xl bg-muted/50 border border-border/50 p-6 text-center">
                              <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground mb-3">
                                Premium obuna kerak
                              </p>
                              <Button size="sm" onClick={() => navigate("/payment")}>
                                Premium olish
                              </Button>
                            </div>
                          ) : (
                            <div className="rounded-xl bg-muted/30 border border-border/50 p-3">
                              <pre className="whitespace-pre-wrap text-sm text-foreground font-mono leading-relaxed">
                                {selectedPrompt.content}
                              </pre>
                            </div>
                          )}
                        </div>

                        {selectedPrompt.instructions && (!selectedPrompt.is_premium || hasPremiumAccess) && (
                          <div>
                            <h3 className="text-sm font-semibold text-foreground mb-2">
                              📋 Qo'llanma
                            </h3>
                            <div className="rounded-xl bg-blue-500/5 border border-blue-500/20 p-3">
                              <p className="text-sm text-foreground whitespace-pre-wrap">
                                {selectedPrompt.instructions}
                              </p>
                            </div>
                          </div>
                        )}

                        {selectedPrompt.examples && (!selectedPrompt.is_premium || hasPremiumAccess) && (
                          <div>
                            <h3 className="text-sm font-semibold text-foreground mb-2">
                              💡 Misollar
                            </h3>
                            <div className="rounded-xl bg-green-500/5 border border-green-500/20 p-3">
                              <p className="text-sm text-foreground whitespace-pre-wrap">
                                {selectedPrompt.examples}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>

                    {/* Mobile Copy Button */}
                    <div className="px-4 py-4 border-t border-border/50">
                      <Button
                        onClick={handleCopyPrompt}
                        className="w-full gap-2"
                        disabled={copied}
                      >
                        {copied ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Nusxalandi!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Promtni nusxalash
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Prompts;
