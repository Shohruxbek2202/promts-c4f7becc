import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  Copy, 
  Check, 
  Lock, 
  ChevronLeft,
  Eye,
  FileText,
  Lightbulb,
  BookOpen
} from "lucide-react";

type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "expert";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Prompt {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  instructions: string;
  examples: string;
  difficulty: DifficultyLevel;
  is_premium: boolean;
  price: number;
  view_count: number;
  copy_count: number;
  version: number;
  categories?: Category;
}

const difficultyColors: Record<DifficultyLevel, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-blue-100 text-blue-700",
  advanced: "bg-orange-100 text-orange-700",
  expert: "bg-red-100 text-red-700",
};

const difficultyLabels: Record<DifficultyLevel, string> = {
  beginner: "Boshlang'ich",
  intermediate: "O'rta",
  advanced: "Ilg'or",
  expert: "Ekspert",
};

const PromptDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPrompt();
    }
  }, [slug]);

  useEffect(() => {
    if (prompt && user) {
      checkAccess();
    } else if (prompt && !prompt.is_premium) {
      setHasAccess(true);
    }
  }, [prompt, user]);

  const fetchPrompt = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("prompts")
      .select(`
        *,
        categories (id, name, slug)
      `)
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (data) {
      setPrompt(data as Prompt);
      // Update view count
      await supabase
        .from("prompts")
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq("id", data.id);
    }
    setIsLoading(false);
  };

  const checkAccess = async () => {
    if (!prompt || !user) return;

    // Free prompts are accessible to everyone
    if (!prompt.is_premium) {
      setHasAccess(true);
      return;
    }

    // Check if user has active subscription or purchased this prompt
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_type, subscription_expires_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile) {
      const hasActiveSubscription = 
        profile.subscription_type !== "free" &&
        (!profile.subscription_expires_at || new Date(profile.subscription_expires_at) > new Date());
      
      if (hasActiveSubscription) {
        setHasAccess(true);
        return;
      }
    }

    // Check if user purchased this specific prompt
    const { data: purchased } = await supabase
      .from("user_prompts")
      .select("id")
      .eq("user_id", user.id)
      .eq("prompt_id", prompt.id)
      .maybeSingle();

    setHasAccess(!!purchased);
  };

  const handleCopy = async () => {
    if (!prompt || !hasAccess) return;

    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      toast.success("Promt nusxalandi!");

      // Update copy count
      await supabase
        .from("prompts")
        .update({ copy_count: (prompt.copy_count || 0) + 1 })
        .eq("id", prompt.id);

      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Nusxalashda xatolik yuz berdi");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto animate-pulse">
              <div className="h-8 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-muted rounded w-3/4 mb-8"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-2xl font-bold mb-4">Promt topilmadi</h1>
            <Link to="/prompts">
              <Button variant="outline">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Promtlarga qaytish
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Back Link */}
            <Link to="/prompts" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Promtlarga qaytish
            </Link>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {prompt.categories && (
                  <Link to={`/prompts?category=${prompt.categories.slug}`}>
                    <Badge variant="outline">{prompt.categories.name}</Badge>
                  </Link>
                )}
                <Badge className={difficultyColors[prompt.difficulty]}>
                  {difficultyLabels[prompt.difficulty]}
                </Badge>
                {prompt.is_premium ? (
                  <Badge variant="secondary" className="gap-1">
                    <Lock className="w-3 h-3" />
                    Premium - {prompt.price?.toLocaleString()} so'm
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    Bepul
                  </Badge>
                )}
              </div>

              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                {prompt.title}
              </h1>

              <p className="text-lg text-muted-foreground mb-4">
                {prompt.description}
              </p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {prompt.view_count} ko'rildi
                </span>
                <span className="flex items-center gap-1">
                  <Copy className="w-4 h-4" />
                  {prompt.copy_count} nusxalandi
                </span>
                <span>v{prompt.version}</span>
              </div>
            </motion.div>

            {/* Prompt Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              {/* Main Prompt */}
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="font-medium">Promt matni</span>
                  </div>
                  {hasAccess && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className="gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Nusxalandi
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Nusxalash
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <div className="p-6">
                  {hasAccess ? (
                    <pre className="whitespace-pre-wrap text-sm text-foreground font-mono bg-muted/30 rounded-lg p-4 overflow-x-auto">
                      {prompt.content}
                    </pre>
                  ) : (
                    <div className="text-center py-12">
                      <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-display text-lg font-semibold mb-2">
                        Premium kontent
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Bu promtni ko'rish uchun obuna bo'ling yoki sotib oling
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        {!user ? (
                          <Link to="/auth">
                            <Button variant="hero">
                              Ro'yxatdan o'tish
                            </Button>
                          </Link>
                        ) : (
                          <>
                            <Link to="/#pricing">
                              <Button variant="hero">
                                Obuna bo'lish
                              </Button>
                            </Link>
                            <Button variant="outline">
                              {prompt.price?.toLocaleString()} so'mga sotib olish
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions */}
              {prompt.instructions && hasAccess && (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  <div className="flex items-center gap-2 px-6 py-4 border-b border-border bg-muted/30">
                    <Lightbulb className="w-5 h-5 text-secondary" />
                    <span className="font-medium">Qo'llanma</span>
                  </div>
                  <div className="p-6">
                    <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {prompt.instructions}
                    </pre>
                  </div>
                </div>
              )}

              {/* Examples */}
              {prompt.examples && hasAccess && (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  <div className="flex items-center gap-2 px-6 py-4 border-b border-border bg-muted/30">
                    <BookOpen className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Namuna</span>
                  </div>
                  <div className="p-6">
                    <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {prompt.examples}
                    </pre>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PromptDetail;
