import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Search, 
  Play,
  Lock,
  Clock,
  BookOpen,
  Filter
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  video_url: string | null;
  video_file_url: string | null;
  thumbnail_url: string | null;
  duration_minutes: number | null;
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
}

const Lessons = () => {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    fetchLessons();
    fetchCategories();
    if (user) {
      checkAccess();
    }
  }, [user]);

  const fetchLessons = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("lessons")
      .select(`
        id, title, slug, description, video_url, video_file_url,
        thumbnail_url, duration_minutes,
        categories (id, name, slug)
      `)
      .eq("is_published", true)
      .order("sort_order");

    if (data) setLessons(data as unknown as Lesson[]);
    setIsLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("sort_order");

    if (data) setCategories(data);
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

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || lesson.categories?.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <Badge className="mb-4">
              <BookOpen className="w-3 h-3 mr-1" />
              Video Darslar
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Professional <span className="text-gradient">marketing darslari</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              AI va marketing bo'yicha to'liq video kurslar. Amaliy bilimlar va real misollar.
            </p>
          </motion.div>

          {/* Access Banner */}
          {!hasAccess && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 rounded-2xl p-6 mb-8 text-center"
            >
              <Lock className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">
                Darslarga kirish uchun obuna bo'ling
              </h3>
              <p className="text-muted-foreground mb-4">
                Barcha video darslardan foydalanish uchun premium obuna talab qilinadi
              </p>
              <Link to="/payment">
                <Button>
                  Obuna bo'lish
                </Button>
              </Link>
            </motion.div>
          )}

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Dars qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === "" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("")}
              >
                <Filter className="w-4 h-4 mr-2" />
                Barchasi
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Lessons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="bg-card rounded-xl border border-border overflow-hidden animate-pulse">
                  <div className="aspect-video bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : filteredLessons.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Darslar topilmadi</p>
              </div>
            ) : (
              filteredLessons.map((lesson, index) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (index % 6) }}
                >
                  <Link
                    to={hasAccess ? `/lessons/${lesson.slug}` : "/payment"}
                    className="block bg-card rounded-xl border border-border overflow-hidden group hover:border-primary/50 transition-all hover:shadow-lg"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-muted">
                      {lesson.thumbnail_url ? (
                        <img
                          src={lesson.thumbnail_url}
                          alt={lesson.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-purple-500/20">
                          <Play className="w-12 h-12 text-primary/50" />
                        </div>
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        {hasAccess ? (
                          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                            <Play className="w-6 h-6 text-primary-foreground ml-1" />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Lock className="w-8 h-8 text-white" />
                            <span className="text-white text-sm">Obuna talab qilinadi</span>
                          </div>
                        )}
                      </div>

                      {/* Duration */}
                      {lesson.duration_minutes && (
                        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          <Clock className="w-3 h-3" />
                          {lesson.duration_minutes} daqiqa
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {lesson.title}
                      </h3>
                      {lesson.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {lesson.description}
                        </p>
                      )}
                      {lesson.categories && (
                        <Badge variant="outline" className="mt-3">
                          {lesson.categories.name}
                        </Badge>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Lessons;
