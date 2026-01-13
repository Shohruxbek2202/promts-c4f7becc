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
  Lock, 
  ChevronRight,
  Sparkles,
  Crown,
  Shield
} from "lucide-react";

type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "expert";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
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
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    if (user) {
      checkAgencyAccess();
    } else if (!isLoading) {
      setCheckingAccess(false);
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (hasAccess) {
      fetchCategories();
      fetchPrompts();
    }
  }, [hasAccess, selectedCategory]);

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
    const { data } = await supabase
      .from("categories")
      .select("id, name, slug, icon")
      .eq("is_active", true)
      .order("sort_order");
    
    if (data) setCategories(data);
  };

  const fetchPrompts = async () => {
    setIsLoadingData(true);
    let query = supabase
      .from("prompts")
      .select(`
        id, title, slug, description, difficulty, is_premium, price, view_count, category_id,
        categories (id, name, slug, icon)
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

    const { data } = await query;
    if (data) setPrompts(data as Prompt[]);
    setIsLoadingData(false);
  };

  const filteredPrompts = prompts.filter(prompt =>
    prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prompt.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 mb-4">
              <Crown className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                Agentlik Premium
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-4">
              Agentlik promtlari
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Faqat agentlik a'zolari uchun maxsus professional promtlar
            </p>
          </motion.div>

          {/* Search */}
          <div className="mb-8">
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

            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant={!selectedCategory ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("")}
                className="rounded-full"
              >
                Barchasi
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.slug ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.slug)}
                  className="rounded-full"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <p className="text-sm text-muted-foreground mb-6 text-center">
            {filteredPrompts.length} ta agentlik promti
          </p>

          {/* Prompts Grid */}
          {isLoadingData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card p-6 animate-pulse">
                  <div className="h-6 bg-muted rounded-lg mb-3 w-3/4"></div>
                  <div className="h-4 bg-muted rounded-lg mb-2 w-full"></div>
                  <div className="h-4 bg-muted rounded-lg w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrompts.map((prompt, index) => (
                <motion.div
                  key={prompt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/prompt/${prompt.slug}`} className="group block h-full">
                    <div className="glass-card p-6 h-full flex flex-col border-amber-500/20 hover:border-amber-500/40 transition-colors">
                      {/* Category & Agency Badge */}
                      <div className="flex items-center justify-between mb-3">
                        {prompt.categories && (
                          <span className="text-xs font-medium text-muted-foreground">
                            {prompt.categories.name}
                          </span>
                        )}
                        <Badge className="gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                          <Crown className="w-3 h-3" />
                          Agentlik
                        </Badge>
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
          {!isLoadingData && filteredPrompts.length === 0 && (
            <div className="text-center py-16">
              <div className="glass-card w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Agentlik promtlari topilmadi
              </h3>
              <p className="text-muted-foreground">
                Hozircha agentlik promtlari qo'shilmagan. Tez orada qo'shiladi!
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Agency;
