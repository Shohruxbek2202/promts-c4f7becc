import { useState, useEffect } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import DOMPurify from "dompurify";
import {
  ArrowLeft, Play, Check, Lock, ChevronLeft, ChevronRight,
  Clock, FileText, Download, GraduationCap
} from "lucide-react";
import { SEOHead } from "@/components/seo";

interface CourseLesson {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content_html: string | null;
  video_url: string | null;
  video_file_url: string | null;
  duration_minutes: number | null;
  sort_order: number | null;
  is_preview: boolean | null;
}

interface CourseMaterial {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
}

const getEmbedUrl = (url: string): string => {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url;
};

const CourseLessonView = () => {
  const { courseSlug, lessonSlug } = useParams();
  const { user, isLoading: authLoading } = useAuth();
  const [lessons, setLessons] = useState<CourseLesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<CourseLesson | null>(null);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [hasAccess, setHasAccess] = useState<boolean | null>(null); // null = still loading
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (courseSlug && user) fetchCourseData();
  }, [courseSlug, user]);

  useEffect(() => {
    if (lessonSlug && lessons.length > 0) {
      const lesson = lessons.find(l => l.slug === lessonSlug);
      if (lesson) {
        setCurrentLesson(lesson);
        fetchMaterials(lesson.id);
      }
    }
  }, [lessonSlug, lessons]);

  const fetchCourseData = async () => {
    setIsLoading(true);
    
    // Get course
    const { data: course } = await supabase
      .from("courses")
      .select("id, title")
      .eq("slug", courseSlug)
      .maybeSingle();

    if (!course) { setIsLoading(false); return; }
    
    setCourseTitle(course.title);
    setCourseId(course.id);

    // Check access
    const { data: uc } = await supabase
      .from("user_courses")
      .select("id")
      .eq("user_id", user!.id)
      .eq("course_id", course.id)
      .maybeSingle();
    
    setHasAccess(!!uc);

    // Fetch lessons
    const { data: lessonsData } = await supabase
      .from("course_lessons")
      .select("id, title, slug, description, content_html, video_url, video_file_url, duration_minutes, sort_order, is_preview")
      .eq("course_id", course.id)
      .eq("is_published", true)
      .order("sort_order");

    if (lessonsData) {
      setLessons(lessonsData);
      if (!lessonSlug && lessonsData.length > 0) {
        setCurrentLesson(lessonsData[0]);
        fetchMaterials(lessonsData[0].id);
      }
    }
    setIsLoading(false);
  };

  const fetchMaterials = async (lessonId: string) => {
    const { data } = await supabase
      .from("course_lesson_materials")
      .select("id, file_name, file_url, file_type, file_size")
      .eq("lesson_id", lessonId)
      .order("sort_order");
    setMaterials(data || []);
  };

  const currentIndex = lessons.findIndex(l => l.id === currentLesson?.id);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  const canViewLesson = (lesson: CourseLesson) => hasAccess || lesson.is_preview;

  if (authLoading || isLoading || hasAccess === null) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  if (!user) return <Navigate to="/auth" replace />;

  if (!hasAccess && !currentLesson?.is_preview) {
    // If we have lessons but none is a preview and user has no access, show locked
    const hasAnyPreview = lessons.some(l => l.is_preview);
    if (!hasAnyPreview || (currentLesson && !currentLesson.is_preview)) {
      return (
        <div className="min-h-screen bg-background">
          <Header />
          <main className="pt-24 pb-16">
            <div className="container mx-auto px-4 text-center">
              <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Kursga kirish cheklangan</h1>
              <p className="text-muted-foreground mb-6">Bu kursni ko'rish uchun sotib oling</p>
              <Link to="/courses"><Button>Kurslarga qaytish</Button></Link>
            </div>
          </main>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={`${currentLesson?.title || "Dars"} - ${courseTitle}`} description={currentLesson?.description || ""} />
      <Header />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Back link */}
          <Link to="/courses" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 gap-1">
            <ArrowLeft className="w-4 h-4" /> {courseTitle}
          </Link>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main content */}
            <div className="flex-1 min-w-0">
              {currentLesson && canViewLesson(currentLesson) ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={currentLesson.id}>
                  {/* Video */}
                  {(currentLesson.video_url || currentLesson.video_file_url) && (
                    <div className="aspect-video rounded-xl overflow-hidden bg-black mb-6">
                      {currentLesson.video_file_url ? (
                        <video src={currentLesson.video_file_url} controls className="w-full h-full" controlsList="nodownload" />
                      ) : currentLesson.video_url && (currentLesson.video_url.includes("youtube") || currentLesson.video_url.includes("youtu.be") || currentLesson.video_url.includes("vimeo")) ? (
                        <iframe src={getEmbedUrl(currentLesson.video_url)} className="w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                      ) : currentLesson.video_url ? (
                        <video src={currentLesson.video_url} controls className="w-full h-full" controlsList="nodownload" />
                      ) : null}
                    </div>
                  )}

                  {/* Title */}
                  <h1 className="text-2xl font-bold text-foreground mb-2">{currentLesson.title}</h1>
                  {currentLesson.description && <p className="text-muted-foreground mb-4">{currentLesson.description}</p>}
                  {currentLesson.duration_minutes && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                      <Clock className="w-4 h-4" /> {currentLesson.duration_minutes} daqiqa
                    </div>
                  )}

                  {/* Content HTML */}
                  {currentLesson.content_html && (
                    <div className="prose prose-sm max-w-none dark:prose-invert mb-6" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentLesson.content_html) }} />
                  )}

                  {/* Materials */}
                  {materials.length > 0 && (
                    <div className="border border-border rounded-xl p-4 mb-6">
                      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><FileText className="w-4 h-4" /> Materiallar</h3>
                      <div className="space-y-2">
                        {materials.map(m => (
                          <a key={m.id} href={m.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                            <Download className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="text-sm text-foreground flex-1 truncate">{m.file_name}</span>
                            {m.file_size && <span className="text-xs text-muted-foreground">{(m.file_size / 1024).toFixed(0)} KB</span>}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    {prevLesson ? (
                      <Link to={`/course/${courseSlug}/lesson/${prevLesson.slug}`}>
                        <Button variant="outline" size="sm" className="gap-1"><ChevronLeft className="w-4 h-4" /> Oldingi</Button>
                      </Link>
                    ) : <div />}
                    {nextLesson ? (
                      <Link to={`/course/${courseSlug}/lesson/${nextLesson.slug}`}>
                        <Button size="sm" className="gap-1">Keyingi <ChevronRight className="w-4 h-4" /></Button>
                      </Link>
                    ) : <div />}
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-20">
                  <GraduationCap className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">Darsni tanlang</p>
                </div>
              )}
            </div>

            {/* Sidebar: Lesson list */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="rounded-xl border border-border bg-card/50 overflow-hidden sticky top-24">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground">Darslar ({lessons.length})</h3>
                </div>
                <ScrollArea className="max-h-[60vh]">
                  <div className="p-2 space-y-1">
                    {lessons.map((lesson, i) => {
                      const isActive = lesson.id === currentLesson?.id;
                      const accessible = canViewLesson(lesson);
                      return (
                        <Link
                          key={lesson.id}
                          to={accessible ? `/course/${courseSlug}/lesson/${lesson.slug}` : "#"}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                            isActive ? "bg-primary/10 border border-primary/20" : accessible ? "hover:bg-muted/50" : "opacity-50 cursor-not-allowed"
                          }`}
                          onClick={e => !accessible && e.preventDefault()}
                        >
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                            isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}>{i + 1}</div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isActive ? "text-primary" : "text-foreground"}`}>{lesson.title}</p>
                            {lesson.duration_minutes && <p className="text-xs text-muted-foreground">{lesson.duration_minutes} daqiqa</p>}
                          </div>
                          {lesson.is_preview ? (
                            <Badge variant="outline" className="text-xs flex-shrink-0">Bepul</Badge>
                          ) : !hasAccess ? (
                            <Lock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          ) : isActive ? (
                            <Play className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CourseLessonView;
