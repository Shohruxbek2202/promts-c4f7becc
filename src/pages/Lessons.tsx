import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Play,
  Lock,
  Clock,
  BookOpen,
  Layers,
  Menu,
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
import { SEOHead, Breadcrumb } from "@/components/seo";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  video_url: string | null;
  video_file_url: string | null;
  thumbnail_url: string | null;
  duration_minutes: number | null;
  category_id: string | null;
  categories?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

// Helper to convert YouTube URL to embed URL
const getEmbedUrl = (url: string): string => {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  return url;
};

const Lessons = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [lessonCounts, setLessonCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const selectedCategory = searchParams.get("category") || "";

  useEffect(() => {
    fetchCategories();
    if (user) {
      checkAccess();
    }
  }, [user]);

  useEffect(() => {
    if (categories.length > 0) {
      fetchLessons();
    }
  }, [selectedCategory, categories]);

  const fetchCategories = async () => {
    const { data: categoriesData } = await supabase
      .from("categories")
      .select("id, name, slug, icon")
      .eq("is_active", true)
      .order("sort_order");
    
    if (categoriesData) {
      setCategories(categoriesData);
      
      // Fetch lesson counts for each category
      const counts: Record<string, number> = {};
      for (const cat of categoriesData) {
        const { count } = await supabase
          .from("lessons")
          .select("id", { count: "exact", head: true })
          .eq("category_id", cat.id)
          .eq("is_published", true);
        counts[cat.id] = count || 0;
      }
      setLessonCounts(counts);
    }
  };

  const fetchLessons = async () => {
    setIsLoading(true);
    let query = supabase
      .from("lessons")
      .select(`
        id, title, slug, description, video_url, video_file_url,
        thumbnail_url, duration_minutes, category_id,
        categories (id, name, slug)
      `)
      .eq("is_published", true)
      .order("sort_order");

    if (selectedCategory) {
      const category = categories.find(c => c.slug === selectedCategory);
      if (category) {
        query = query.eq("category_id", category.id);
      }
    }

    const { data } = await query;
    if (data) {
      setLessons(data as unknown as Lesson[]);
      
      // Check if there's a lesson slug in URL
      const lessonSlug = searchParams.get("lesson");
      if (lessonSlug) {
        const urlLesson = (data as unknown as Lesson[]).find(l => l.slug === lessonSlug);
        if (urlLesson) {
          setSelectedLesson(urlLesson);
        }
      } else if (data.length > 0 && !selectedLesson && window.innerWidth >= 1024) {
        // Auto-select first lesson only on desktop
        setSelectedLesson(data[0] as unknown as Lesson);
      }
    }
    setIsLoading(false);
  };

  const checkAccess = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_type, subscription_expires_at")
      .eq("user_id", user.id)
      .single();

    if (profile) {
      const hasValidSubscription = 
        profile.subscription_type && 
        profile.subscription_type !== "free" &&
        (!profile.subscription_expires_at || new Date(profile.subscription_expires_at) > new Date());
      
      setHasAccess(!!hasValidSubscription);
    }
  };

  const filteredLessons = lessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCategoryChange = (slug: string) => {
    if (slug === selectedCategory) {
      searchParams.delete("category");
    } else {
      searchParams.set("category", slug);
    }
    searchParams.delete("lesson");
    setSearchParams(searchParams);
    setIsMobileMenuOpen(false);
    setSelectedLesson(null);
  };

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    searchParams.set("lesson", lesson.slug);
    setSearchParams(searchParams);
  };

  const totalLessonsCount = Object.values(lessonCounts).reduce((a, b) => a + b, 0);

  const currentCategoryName = selectedCategory 
    ? categories.find(c => c.slug === selectedCategory)?.name || "Kategoriya"
    : "Barcha darslar";

  const defaultCategoryIcons: Record<string, string> = {
    "google-ads": "🎯",
    "meta-ads": "📢",
    "content-marketing": "✍️",
    "email-marketing": "📧",
    "smm-strategy": "👥",
    "seo-prompts": "🌐",
    "copywriting": "📝",
    "video-marketing": "🎬",
    "ai-tools": "🤖",
  };

  const isEmoji = (str: string) => {
    const emojiRegex = /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]$/u;
    return emojiRegex.test(str) || str.length <= 2;
  };

  const renderIcon = (icon: string | null, slug?: string) => {
    if (icon && isEmoji(icon)) {
      return <span className="text-base">{icon}</span>;
    }
    if (slug && defaultCategoryIcons[slug]) {
      return <span className="text-base">{defaultCategoryIcons[slug]}</span>;
    }
    return <BookOpen className="w-4 h-4 text-primary" />;
  };

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
          {totalLessonsCount}
        </span>
      </button>

      {categories.filter(c => lessonCounts[c.id] > 0).map((category) => (
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
            {lessonCounts[category.id] || 0}
          </span>
        </button>
      ))}
    </div>
  );

  const getVideoUrl = (lesson: Lesson) => {
    return lesson.video_file_url || lesson.video_url;
  };

  const isEmbeddable = (url: string) => {
    return url.includes("youtube") || url.includes("youtu.be") || url.includes("vimeo");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Marketing Video Darslari - AI va Digital Marketing Kurslari"
        description="AI va digital marketing bo'yicha to'liq video kurslar. AI, Google Ads, Meta Ads va boshqa mavzular bo'yicha amaliy darslar."
        keywords={["marketing darslar", "video kurslar", "AI o'rganish", "digital marketing", "AI darslar"]}
        canonicalUrl="https://mpbs.uz/lessons"
      />
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Breadcrumb 
            items={selectedCategory 
              ? [{ label: "Darslar", href: "/lessons" }, { label: currentCategoryName }]
              : [{ label: "Darslar" }]
            } 
            className="mb-4" 
          />
          
          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Dars qidirish..."
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
            <div className="flex h-[calc(100vh-220px)] md:h-[75vh]">
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

              {/* Column 2: Lessons List */}
              <div className="w-full lg:w-80 border-r border-border/50 bg-card/30 flex flex-col flex-shrink-0">
                <div className="px-4 py-3 border-b border-border/50">
                  <h2 className="font-semibold text-foreground">{currentCategoryName}</h2>
                  <p className="text-xs text-muted-foreground">{filteredLessons.length} ta dars</p>
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
                  ) : filteredLessons.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                      <BookOpen className="w-8 h-8 text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground">Darslar topilmadi</p>
                    </div>
                  ) : (
                    <div className="p-2 space-y-1">
                      {filteredLessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          onClick={() => handleSelectLesson(lesson)}
                          className={`w-full text-left p-3 rounded-lg transition-all ${
                            selectedLesson?.id === lesson.id
                              ? "bg-primary/20 border border-primary/30"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Thumbnail */}
                            <div className="relative w-16 h-10 rounded overflow-hidden bg-muted flex-shrink-0">
                              {lesson.thumbnail_url ? (
                                <img
                                  src={lesson.thumbnail_url}
                                  alt={lesson.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-purple-500/20">
                                  <Play className="w-4 h-4 text-primary/50" />
                                </div>
                              )}
                              {!hasAccess && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                  <Lock className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm text-foreground line-clamp-1">
                                {lesson.title}
                              </h3>
                              {lesson.duration_minutes && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                  <Clock className="w-3 h-3" />
                                  {lesson.duration_minutes} daqiqa
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Column 3: Lesson Detail */}
              <div className="hidden lg:flex flex-1 flex-col bg-background/50">
                {selectedLesson ? (
                  <>
                    {/* Detail Header */}
                    <div className="px-6 py-4 border-b border-border/50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {selectedLesson.categories && (
                              <Badge variant="outline" className="text-xs">
                                {selectedLesson.categories.name}
                              </Badge>
                            )}
                            {hasAccess ? (
                              <Badge variant="outline" className="text-green-600 border-green-600/30 text-xs">
                                Kirish mumkin
                              </Badge>
                            ) : (
                              <Badge className="gap-1 bg-primary/10 text-primary border-0 text-xs">
                                <Lock className="w-3 h-3" />
                                Premium
                              </Badge>
                            )}
                          </div>
                          <h1 className="text-xl font-bold text-foreground">
                            {selectedLesson.title}
                          </h1>
                          {selectedLesson.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {selectedLesson.description}
                            </p>
                          )}
                        </div>
                        {selectedLesson.duration_minutes && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {selectedLesson.duration_minutes} daqiqa
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Video Content */}
                    <ScrollArea className="flex-1 p-6">
                      <div className="space-y-6">
                        {hasAccess ? (
                          getVideoUrl(selectedLesson) ? (
                            <div className="rounded-xl overflow-hidden bg-black">
                              {isEmbeddable(getVideoUrl(selectedLesson)!) ? (
                                <div className="aspect-video">
                                  <iframe
                                    src={getEmbedUrl(getVideoUrl(selectedLesson)!)}
                                    className="w-full h-full"
                                    allowFullScreen
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  />
                                </div>
                              ) : (
                                <video
                                  src={getVideoUrl(selectedLesson)!}
                                  controls
                                  className="w-full"
                                />
                              )}
                            </div>
                          ) : (
                            <div className="aspect-video rounded-xl bg-muted/30 flex items-center justify-center">
                              <div className="text-center">
                                <Play className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                                <p className="text-muted-foreground">Video hali yuklanmagan</p>
                              </div>
                            </div>
                          )
                        ) : (
                          <div className="aspect-video rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center">
                            <div className="text-center p-6">
                              <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                              <h4 className="font-semibold text-foreground mb-2">Premium kontent</h4>
                              <p className="text-sm text-muted-foreground mb-4">
                                Bu darsni ko'rish uchun premium obunaga o'ting
                              </p>
                              <Button onClick={() => window.location.href = "/payment"}>
                                Premium olish
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-center p-6">
                    <div>
                      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                        <Play className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">
                        Darsni tanlang
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Chap tomondagi ro'yxatdan darsni tanlang
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Lesson Detail */}
              {selectedLesson && (
                <div className="lg:hidden fixed inset-0 z-50 bg-background">
                  <div className="flex flex-col h-full">
                    {/* Mobile Header */}
                    <div className="px-4 py-3 border-b border-border/50 flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedLesson(null)}
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </Button>
                      <div className="flex-1">
                        <h2 className="font-semibold text-foreground line-clamp-1">
                          {selectedLesson.title}
                        </h2>
                      </div>
                    </div>

                    {/* Mobile Content */}
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          {selectedLesson.categories && (
                            <Badge variant="outline" className="text-xs">
                              {selectedLesson.categories.name}
                            </Badge>
                          )}
                          {hasAccess ? (
                            <Badge variant="outline" className="text-green-600 border-green-600/30 text-xs">
                              Kirish mumkin
                            </Badge>
                          ) : (
                            <Badge className="gap-1 bg-primary/10 text-primary border-0 text-xs">
                              <Lock className="w-3 h-3" />
                              Premium
                            </Badge>
                          )}
                        </div>

                        {selectedLesson.description && (
                          <p className="text-sm text-muted-foreground">
                            {selectedLesson.description}
                          </p>
                        )}

                        {/* Video */}
                        {hasAccess ? (
                          getVideoUrl(selectedLesson) ? (
                            <div className="rounded-xl overflow-hidden bg-black">
                              {isEmbeddable(getVideoUrl(selectedLesson)!) ? (
                                <div className="aspect-video">
                                  <iframe
                                    src={getEmbedUrl(getVideoUrl(selectedLesson)!)}
                                    className="w-full h-full"
                                    allowFullScreen
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  />
                                </div>
                              ) : (
                                <video
                                  src={getVideoUrl(selectedLesson)!}
                                  controls
                                  className="w-full"
                                />
                              )}
                            </div>
                          ) : (
                            <div className="aspect-video rounded-xl bg-muted/30 flex items-center justify-center">
                              <p className="text-muted-foreground">Video hali yuklanmagan</p>
                            </div>
                          )
                        ) : (
                          <div className="aspect-video rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center">
                            <div className="text-center p-6">
                              <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground mb-3">Premium obuna kerak</p>
                              <Button size="sm" onClick={() => window.location.href = "/payment"}>
                                Premium olish
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
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

export default Lessons;
