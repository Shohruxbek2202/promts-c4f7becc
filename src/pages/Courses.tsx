import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search, BookOpen, Clock, Layers, Menu, ArrowLeft, GraduationCap,
  Play, Lock, User, ShoppingCart, Check,
} from "lucide-react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { SEOHead, Breadcrumb } from "@/components/seo";
import DOMPurify from "dompurify";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content_html: string | null;
  cover_image_url: string | null;
  instructor_name: string | null;
  instructor_bio: string | null;
  instructor_avatar_url: string | null;
  price: number;
  discount_price: number | null;
  category_id: string | null;
  duration_minutes: number;
  lessons_count: number;
  categories?: { id: string; name: string; slug: string } | null;
}

interface CourseLesson {
  id: string;
  title: string;
  slug: string;
  duration_minutes: number | null;
  sort_order: number;
  is_preview: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

const getEmbedUrl = (url: string): string => {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url;
};

const Courses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [courseCounts, setCourseCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseLessons, setCourseLessons] = useState<CourseLesson[]>([]);
  const [purchasedCourseIds, setPurchasedCourseIds] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const selectedCategory = searchParams.get("category") || "";

  useEffect(() => {
    fetchCategories();
    if (user) fetchPurchasedCourses();
  }, [user]);

  useEffect(() => {
    if (categories.length >= 0) fetchCourses();
  }, [selectedCategory, categories]);

  const fetchCategories = async () => {
    // Parallel fetch: categories + all published courses (for counting)
    const [{ data: catData }, { data: allCourses }] = await Promise.all([
      supabase.from("categories").select("id, name, slug, icon").eq("is_active", true).order("sort_order"),
      supabase.from("courses").select("category_id").eq("is_published", true),
    ]);
    if (catData) {
      setCategories(catData);
      const counts: Record<string, number> = {};
      for (const course of allCourses || []) {
        if (course.category_id) counts[course.category_id] = (counts[course.category_id] || 0) + 1;
      }
      setCourseCounts(counts);
    }
  };

  const fetchCourses = async () => {
    setIsLoading(true);
    let query = supabase.from("courses")
      .select("id, title, slug, description, content_html, cover_image_url, instructor_name, instructor_bio, instructor_avatar_url, price, discount_price, category_id, duration_minutes, lessons_count, categories (id, name, slug)")
      .eq("is_published", true).order("sort_order");

    if (selectedCategory) {
      const cat = categories.find(c => c.slug === selectedCategory);
      if (cat) query = query.eq("category_id", cat.id);
    }

    const { data } = await query;
    if (data) {
      setCourses(data as unknown as Course[]);
      const courseSlug = searchParams.get("course");
      if (courseSlug) {
        const urlCourse = (data as unknown as Course[]).find(c => c.slug === courseSlug);
        if (urlCourse) { setSelectedCourse(urlCourse); fetchCourseLessons(urlCourse.id); }
      } else if (data.length > 0 && !selectedCourse && window.innerWidth >= 1024) {
        const first = data[0] as unknown as Course;
        setSelectedCourse(first);
        fetchCourseLessons(first.id);
      }
    }
    setIsLoading(false);
  };

  const fetchCourseLessons = async (courseId: string) => {
    const { data } = await supabase.from("course_lessons")
      .select("id, title, slug, duration_minutes, sort_order, is_preview")
      .eq("course_id", courseId).eq("is_published", true).order("sort_order");
    if (data) setCourseLessons(data as CourseLesson[]);
  };

  const fetchPurchasedCourses = async () => {
    if (!user) return;
    const { data } = await supabase.from("user_courses").select("course_id").eq("user_id", user.id);
    if (data) setPurchasedCourseIds(data.map(d => d.course_id));
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    searchParams.set("course", course.slug);
    setSearchParams(searchParams);
    fetchCourseLessons(course.id);
  };

  const handleCategoryChange = (slug: string) => {
    if (slug === selectedCategory) searchParams.delete("category");
    else searchParams.set("category", slug);
    searchParams.delete("course");
    setSearchParams(searchParams);
    setIsMobileMenuOpen(false);
    setSelectedCourse(null);
    setCourseLessons([]);
  };

  const hasPurchased = (courseId: string) => purchasedCourseIds.includes(courseId);

  const formatPrice = (price: number) => new Intl.NumberFormat("uz-UZ").format(price) + " so'm";

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCoursesCount = Object.values(courseCounts).reduce((a, b) => a + b, 0);
  const currentCategoryName = selectedCategory
    ? categories.find(c => c.slug === selectedCategory)?.name || "Kategoriya"
    : "Barcha kurslar";

  const CategoriesList = () => (
    <div className="flex-1 overflow-y-auto">
      <button onClick={() => handleCategoryChange("")}
        className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${!selectedCategory ? "bg-primary/20 text-primary" : "hover:bg-muted/50 text-foreground"}`}>
        <Layers className="w-4 h-4 text-primary" />
        <span className="flex-1 text-left text-sm font-medium truncate">Barchasi</span>
        <span className="text-xs text-muted-foreground">{totalCoursesCount}</span>
      </button>
      {categories.filter(c => courseCounts[c.id] > 0).map(cat => (
        <button key={cat.id} onClick={() => handleCategoryChange(cat.slug)}
          className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${selectedCategory === cat.slug ? "bg-primary/20 text-primary" : "hover:bg-muted/50 text-foreground"}`}>
          <span className="text-base">{cat.icon || "📚"}</span>
          <span className="flex-1 text-left text-sm font-medium truncate">{cat.name}</span>
          <span className="text-xs text-muted-foreground">{courseCounts[cat.id] || 0}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Online Kurslar - MPBS.uz" description="AI va digital marketing bo'yicha professional online kurslar." keywords={["online kurslar", "marketing kurslar", "AI kurslar"]} canonicalUrl="https://mpbs.uz/courses" />
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Breadcrumb items={selectedCategory ? [{ label: "Kurslar", href: "/courses" }, { label: currentCategoryName }] : [{ label: "Kurslar" }]} className="mb-4" />

          <div className="relative max-w-xl mx-auto mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input type="text" placeholder="Kurs qidirish..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-12 h-12 rounded-full glass-button border-0" />
          </div>

          {/* Mobile category */}
          <div className="lg:hidden mb-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild><Button variant="outline" className="w-full gap-2"><Menu className="w-4 h-4" />{currentCategoryName}</Button></SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetHeader className="px-4 py-3 border-b border-border/50"><SheetTitle className="text-left">Kategoriyalar</SheetTitle></SheetHeader>
                <CategoriesList />
              </SheetContent>
            </Sheet>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden shadow-2xl">
            <div className="flex h-[calc(100vh-220px)] md:h-[75vh]">
              {/* Col 1: Categories */}
              <div className="hidden lg:flex w-56 border-r border-border/50 bg-card/50 flex-col flex-shrink-0">
                <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" /><div className="w-3 h-3 rounded-full bg-yellow-500" /><div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="px-4 py-2"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Kategoriyalar</span></div>
                <ScrollArea className="flex-1"><CategoriesList /></ScrollArea>
              </div>

              {/* Col 2: Course List */}
              <div className="w-full lg:w-80 border-r border-border/50 bg-card/30 flex flex-col flex-shrink-0">
                <div className="px-4 py-3 border-b border-border/50">
                  <h2 className="font-semibold text-foreground">{currentCategoryName}</h2>
                  <p className="text-xs text-muted-foreground">{filteredCourses.length} ta kurs</p>
                </div>
                <ScrollArea className="flex-1">
                  {isLoading ? (
                    <div className="p-4 space-y-3">{[...Array(4)].map((_, i) => (<div key={i} className="p-3 rounded-lg bg-muted/30 animate-pulse"><div className="h-4 bg-muted rounded w-3/4 mb-2" /><div className="h-3 bg-muted rounded w-full" /></div>))}</div>
                  ) : filteredCourses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center p-4"><GraduationCap className="w-8 h-8 text-muted-foreground mb-3" /><p className="text-sm text-muted-foreground">Kurslar topilmadi</p></div>
                  ) : (
                    <div className="p-2 space-y-1">
                      {filteredCourses.map(course => (
                        <button key={course.id} onClick={() => handleSelectCourse(course)}
                          className={`w-full text-left p-3 rounded-lg transition-all ${selectedCourse?.id === course.id ? "bg-primary/20 border border-primary/30" : "hover:bg-muted/50"}`}>
                          <div className="flex items-start gap-3">
                            <div className="relative w-16 h-10 rounded overflow-hidden bg-muted flex-shrink-0">
                              {course.cover_image_url ? <img src={course.cover_image_url} alt={course.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-purple-500/20"><GraduationCap className="w-4 h-4 text-primary/50" /></div>}
                              {hasPurchased(course.id) && <div className="absolute top-0 right-0 bg-green-500 rounded-bl p-0.5"><Check className="w-2.5 h-2.5 text-white" /></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm text-foreground line-clamp-1">{course.title}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-semibold text-primary">{course.discount_price ? formatPrice(course.discount_price) : formatPrice(course.price)}</span>
                                <span className="text-xs text-muted-foreground">{course.lessons_count} dars</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Col 3: Course Detail */}
              <div className="hidden lg:flex flex-1 flex-col bg-background/50">
                {selectedCourse ? (
                  <ScrollArea className="flex-1">
                    <div className="p-6 space-y-6">
                      {/* Cover */}
                      {selectedCourse.cover_image_url && (
                        <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                          <img src={selectedCourse.cover_image_url} alt={selectedCourse.title} className="w-full h-full object-cover" />
                        </div>
                      )}

                      {/* Title & Price */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {selectedCourse.categories && <Badge variant="outline" className="text-xs">{selectedCourse.categories.name}</Badge>}
                          {hasPurchased(selectedCourse.id) && <Badge className="bg-green-500/10 text-green-600 border-0 text-xs"><Check className="w-3 h-3 mr-1" />Sotib olingan</Badge>}
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">{selectedCourse.title}</h1>
                        {selectedCourse.description && <p className="text-muted-foreground mt-2">{selectedCourse.description}</p>}

                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center gap-2">
                            {selectedCourse.discount_price ? (
                              <><span className="text-2xl font-bold text-primary">{formatPrice(selectedCourse.discount_price)}</span><span className="text-lg text-muted-foreground line-through">{formatPrice(selectedCourse.price)}</span></>
                            ) : (
                              <span className="text-2xl font-bold text-primary">{formatPrice(selectedCourse.price)}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{selectedCourse.lessons_count} dars</span>
                            {selectedCourse.duration_minutes > 0 && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{selectedCourse.duration_minutes} daqiqa</span>}
                          </div>
                        </div>

                        {!hasPurchased(selectedCourse.id) && (
                          <Button className="mt-4 gap-2" onClick={() => navigate(`/course-payment/${selectedCourse.slug}`)}>
                            <ShoppingCart className="w-4 h-4" /> Sotib olish
                          </Button>
                        )}
                      </div>

                      {/* Instructor */}
                      {selectedCourse.instructor_name && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/50">
                          {selectedCourse.instructor_avatar_url ? (
                            <img src={selectedCourse.instructor_avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><User className="w-6 h-6 text-primary" /></div>
                          )}
                          <div>
                            <p className="font-semibold text-foreground">{selectedCourse.instructor_name}</p>
                            {selectedCourse.instructor_bio && <p className="text-sm text-muted-foreground line-clamp-2">{selectedCourse.instructor_bio}</p>}
                          </div>
                        </div>
                      )}

                      {/* Lessons */}
                      {courseLessons.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-foreground mb-3">Kurs dasturi ({courseLessons.length} dars)</h3>
                          <div className="space-y-2">
                            {courseLessons.map((lesson, i) => {
                              const accessible = hasPurchased(selectedCourse.id) || lesson.is_preview;
                              const Wrapper = accessible ? Link : "div" as any;
                              const wrapperProps = accessible ? { to: `/course/${selectedCourse.slug}/lesson/${lesson.slug}` } : {};
                              return (
                                <Wrapper key={lesson.id} {...wrapperProps} className={`flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30 ${accessible ? "hover:bg-muted/40 cursor-pointer transition-colors" : ""}`}>
                                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground flex-shrink-0">{i + 1}</div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{lesson.title}</p>
                                    {lesson.duration_minutes && <p className="text-xs text-muted-foreground">{lesson.duration_minutes} daqiqa</p>}
                                  </div>
                                  {lesson.is_preview ? (
                                    <Badge variant="outline" className="text-xs flex-shrink-0">Bepul</Badge>
                                  ) : !hasPurchased(selectedCourse.id) ? (
                                    <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                  ) : (
                                    <Play className="w-4 h-4 text-primary flex-shrink-0" />
                                  )}
                                </Wrapper>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* HTML Content */}
                      {selectedCourse.content_html && (
                        <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedCourse.content_html) }} />
                      )}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex-1 flex items-center justify-center"><div className="text-center"><GraduationCap className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" /><p className="text-muted-foreground">Kursni tanlang</p></div></div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Mobile Detail */}
          {selectedCourse && (
            <div className="lg:hidden mt-4">
              <Button variant="ghost" className="mb-3 gap-1 text-sm" onClick={() => { setSelectedCourse(null); searchParams.delete("course"); setSearchParams(searchParams); }}>
                <ArrowLeft className="w-4 h-4" /> Ortga
              </Button>
              <div className="bg-card rounded-xl border border-border/50 p-4 space-y-4">
                {selectedCourse.cover_image_url && <img src={selectedCourse.cover_image_url} alt={selectedCourse.title} className="w-full aspect-video object-cover rounded-lg" />}
                <div>
                  <h2 className="text-xl font-bold text-foreground">{selectedCourse.title}</h2>
                  {selectedCourse.description && <p className="text-sm text-muted-foreground mt-1">{selectedCourse.description}</p>}
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xl font-bold text-primary">{selectedCourse.discount_price ? formatPrice(selectedCourse.discount_price) : formatPrice(selectedCourse.price)}</span>
                    <span className="text-sm text-muted-foreground">{selectedCourse.lessons_count} dars</span>
                  </div>
                  {!hasPurchased(selectedCourse.id) && (
                    <Button className="w-full mt-3 gap-2" onClick={() => navigate(`/course-payment/${selectedCourse.slug}`)}>
                      <ShoppingCart className="w-4 h-4" /> Sotib olish
                    </Button>
                  )}
                  {hasPurchased(selectedCourse.id) && <Badge className="bg-green-500/10 text-green-600 border-0 mt-3"><Check className="w-3 h-3 mr-1" />Sotib olingan</Badge>}
                </div>
                {courseLessons.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Darslar</h3>
                    <div className="space-y-2">
                      {courseLessons.map((lesson, i) => {
                        const accessible = hasPurchased(selectedCourse.id) || lesson.is_preview;
                        const content = (
                          <div key={lesson.id} className={`flex items-center gap-3 p-3 rounded-lg bg-muted/20 ${accessible ? "hover:bg-muted/40 cursor-pointer" : ""}`}>
                            <span className="text-xs font-medium text-muted-foreground w-6 text-center">{i + 1}</span>
                            <span className="text-sm text-foreground flex-1 truncate">{lesson.title}</span>
                            {lesson.is_preview ? <Badge variant="outline" className="text-xs">Bepul</Badge> : !hasPurchased(selectedCourse.id) ? <Lock className="w-3.5 h-3.5 text-muted-foreground" /> : <Play className="w-3.5 h-3.5 text-primary" />}
                          </div>
                        );
                        return accessible ? <Link key={lesson.id} to={`/course/${selectedCourse.slug}/lesson/${lesson.slug}`}>{content}</Link> : content;
                      })}
                    </div>
                  </div>
                )}
                {selectedCourse.content_html && <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedCourse.content_html) }} />}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Courses;
