import { useState, useEffect, useCallback } from "react";
import { useParams, Navigate, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import DOMPurify from "dompurify";
import {
  ArrowLeft, Play, Check, Lock, ChevronLeft, ChevronRight,
  Clock, FileText, Download, GraduationCap, CheckCircle
} from "lucide-react";
import { SEOHead } from "@/components/seo";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getEmbedUrl = (url: string): string => {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url;
};

const isEmbedVideo = (url: string) =>
  url.includes("youtube") || url.includes("youtu.be") || url.includes("vimeo");

// ─── Signed Video URL Hook ────────────────────────────────────────────────────

const useSignedVideoUrl = (filePath: string | null | undefined, userId: string | undefined) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!filePath || !userId) { setSignedUrl(null); return; }
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      setSignedUrl(filePath);
      return;
    }
    supabase.functions
      .invoke("get-video-url", { body: { filePath, bucket: "lesson-videos" } })
      .then(({ data }) => { if (data?.signedUrl) setSignedUrl(data.signedUrl); });
  }, [filePath, userId]);

  return signedUrl;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const LoadingSpinner = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

const LockedPage = ({ courseSlug }: { courseSlug: string }) => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4 text-center">
        <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Kursga kirish cheklangan</h1>
        <p className="text-muted-foreground mb-6">Bu kursni ko'rish uchun sotib oling</p>
        <div className="flex gap-3 justify-center">
          <Link to="/courses"><Button variant="outline">Kurslarga qaytish</Button></Link>
          <Link to={`/course-payment/${courseSlug}`}><Button>Kursni sotib olish</Button></Link>
        </div>
      </div>
    </main>
  </div>
);

const VideoPlayer = ({
  lesson,
  signedUrl,
  userEmail,
}: {
  lesson: CourseLesson;
  signedUrl: string | null;
  userEmail?: string;
}) => {
  if (!lesson.video_url && !lesson.video_file_url) return null;

  const watermark = userEmail ? (
    <div className="absolute inset-0 pointer-events-none z-10 flex items-end justify-end p-4 opacity-30">
      <span className="text-xs text-white font-mono select-none" style={{ textShadow: "0 0 4px rgba(0,0,0,0.8)" }}>
        {userEmail}
      </span>
    </div>
  ) : null;

  return (
    <div className="aspect-video rounded-xl overflow-hidden bg-black mb-6 relative select-none" onContextMenu={e => e.preventDefault()}>
      {lesson.video_file_url ? (
        signedUrl ? (
          <video
            src={signedUrl}
            controls
            className="w-full h-full"
            controlsList="nodownload noremoteplayback"
            disablePictureInPicture
            playsInline
            onContextMenu={(e) => e.preventDefault()}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )
      ) : lesson.video_url && isEmbedVideo(lesson.video_url) ? (
        <iframe
          src={getEmbedUrl(lesson.video_url)}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      ) : lesson.video_url ? (
        <video src={lesson.video_url} controls className="w-full h-full" controlsList="nodownload noremoteplayback" disablePictureInPicture onContextMenu={e => e.preventDefault()} />
      ) : null}
      {watermark}
    </div>
  );
};

const MaterialsList = ({ materials }: { materials: CourseMaterial[] }) => {
  if (materials.length === 0) return null;
  return (
    <div className="border border-border rounded-xl p-4 mb-6">
      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
        <FileText className="w-4 h-4" /> Materiallar
      </h3>
      <div className="space-y-2">
        {materials.map((m) => (
          <a
            key={m.id}
            href={m.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <Download className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm text-foreground flex-1 truncate">{m.file_name}</span>
            {m.file_size && (
              <span className="text-xs text-muted-foreground">
                {(m.file_size / 1024).toFixed(0)} KB
              </span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const CourseLessonView = () => {
  const { courseSlug, lessonSlug } = useParams();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  const [lessons, setLessons] = useState<CourseLesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<CourseLesson | null>(null);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [progressPercent, setProgressPercent] = useState(0);

  const signedVideoUrl = useSignedVideoUrl(currentLesson?.video_file_url, user?.id);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchMaterials = useCallback(async (lessonId: string) => {
    const { data } = await supabase
      .from("course_lesson_materials")
      .select("id, file_name, file_url, file_type, file_size")
      .eq("lesson_id", lessonId)
      .order("sort_order");
    setMaterials(data || []);
  }, []);

  const fetchCourseData = useCallback(async () => {
    if (!courseSlug || !user) return;
    setIsLoading(true);

    const { data: course } = await supabase
      .from("courses")
      .select("id, title")
      .eq("slug", courseSlug)
      .maybeSingle();

    if (!course) { setIsLoading(false); return; }

    setCourseTitle(course.title);
    setCourseId(course.id);

    // Check if user has purchased the course
    const { data: uc } = await supabase
      .from("user_courses")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .maybeSingle();

    setHasAccess(!!uc);

    const { data: lessonsData } = await supabase
      .from("course_lessons")
      .select(
        "id, title, slug, description, content_html, video_url, video_file_url, duration_minutes, sort_order, is_preview"
      )
      .eq("course_id", course.id)
      .eq("is_published", true)
      .order("sort_order");

    if (lessonsData) {
      setLessons(lessonsData);
      // If no specific lesson in URL, open first one
      if (!lessonSlug && lessonsData.length > 0) {
        setCurrentLesson(lessonsData[0]);
        fetchMaterials(lessonsData[0].id);
      }
    }

    // Fetch progress
    const { data: progressData } = await supabase
      .from("user_lesson_progress")
      .select("lesson_id")
      .eq("user_id", user.id)
      .eq("course_id", course.id);
    if (progressData) {
      setCompletedLessons(new Set(progressData.map(p => p.lesson_id)));
      const total = lessonsData?.length || 0;
      setProgressPercent(total > 0 ? Math.round((progressData.length / total) * 100) : 0);
    }

    setIsLoading(false);
  }, [courseSlug, user, lessonSlug, fetchMaterials]);

  useEffect(() => { fetchCourseData(); }, [fetchCourseData]);

  const toggleLessonComplete = async (lessonId: string) => {
    if (!user || !courseId) return;
    const isCompleted = completedLessons.has(lessonId);
    if (isCompleted) {
      await supabase.from("user_lesson_progress").delete().eq("user_id", user.id).eq("lesson_id", lessonId);
      setCompletedLessons(prev => { const n = new Set(prev); n.delete(lessonId); return n; });
    } else {
      await supabase.from("user_lesson_progress").insert({ user_id: user.id, lesson_id: lessonId, course_id: courseId });
      setCompletedLessons(prev => new Set(prev).add(lessonId));
      toast.success("Dars tugallandi! ✅");
    }
    // Recalculate
    const totalLessons = lessons.filter(l => canViewLesson(l)).length || lessons.length;
    const newCompleted = isCompleted ? completedLessons.size - 1 : completedLessons.size + 1;
    setProgressPercent(totalLessons > 0 ? Math.round((newCompleted / totalLessons) * 100) : 0);
  };

  // Sync currentLesson from URL slug
  useEffect(() => {
    if (!lessonSlug || lessons.length === 0) return;
    const lesson = lessons.find((l) => l.slug === lessonSlug);
    if (lesson) {
      setCurrentLesson(lesson);
      fetchMaterials(lesson.id);
    }
  }, [lessonSlug, lessons, fetchMaterials]);

  // ── Derived state ──────────────────────────────────────────────────────────

  const currentIndex = lessons.findIndex((l) => l.id === currentLesson?.id);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  /**
   * Access rules:
   *  - Purchased (hasAccess = true)  → all lessons
   *  - Not purchased                 → only is_preview lessons
   */
  const canViewLesson = (lesson: CourseLesson) => !!hasAccess || !!lesson.is_preview;

  // ── Loading / Auth guards ──────────────────────────────────────────────────

  if (authLoading || isLoading || hasAccess === null) return <LoadingSpinner />;
  if (!user) return <Navigate to="/auth" replace />;

  // If current lesson is locked and user has no access → show locked page
  if (currentLesson && !canViewLesson(currentLesson)) {
    return <LockedPage courseSlug={courseSlug!} />;
  }

  // If no current lesson yet but no preview lessons exist → locked
  if (!currentLesson && lessons.length > 0 && !hasAccess) {
    const hasAnyPreview = lessons.some((l) => l.is_preview);
    if (!hasAnyPreview) return <LockedPage courseSlug={courseSlug!} />;
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${currentLesson?.title || "Dars"} - ${courseTitle}`}
        description={currentLesson?.description || ""}
      />
      <Header />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Back link */}
          <Link
            to="/courses"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> {courseTitle}
          </Link>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* ── Main content ── */}
            <div className="flex-1 min-w-0">
              {currentLesson && canViewLesson(currentLesson) ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={currentLesson.id}
                >
                  <VideoPlayer lesson={currentLesson} signedUrl={signedVideoUrl} userEmail={user?.email || undefined} />

                  <h1 className="text-2xl font-bold text-foreground mb-2">{currentLesson.title}</h1>

                  {currentLesson.description && (
                    <p className="text-muted-foreground mb-4">{currentLesson.description}</p>
                  )}

                  {currentLesson.duration_minutes && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                      <Clock className="w-4 h-4" /> {currentLesson.duration_minutes} daqiqa
                    </div>
                  )}

                  {currentLesson.content_html && (
                    <div
                      className="prose prose-sm max-w-none dark:prose-invert mb-6"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(currentLesson.content_html),
                      }}
                    />
                  )}

                  <MaterialsList materials={materials} />

                   {/* Mark complete button */}
                   {hasAccess && (
                     <div className="mt-4">
                       <Button
                         variant={completedLessons.has(currentLesson.id) ? "outline" : "default"}
                         className="w-full gap-2"
                         onClick={() => toggleLessonComplete(currentLesson.id)}
                       >
                         <CheckCircle className="w-4 h-4" />
                         {completedLessons.has(currentLesson.id) ? "Tugallangan ✓" : "Darsni tugallash"}
                       </Button>
                     </div>
                   )}

                   {/* Prev / Next navigation */}
                   <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
                     {prevLesson && canViewLesson(prevLesson) ? (
                       <Link to={`/course/${courseSlug}/lesson/${prevLesson.slug}`}>
                         <Button variant="outline" size="sm" className="gap-1">
                           <ChevronLeft className="w-4 h-4" /> Oldingi
                         </Button>
                       </Link>
                     ) : <div />}

                     {nextLesson ? (
                       canViewLesson(nextLesson) ? (
                         <Link to={`/course/${courseSlug}/lesson/${nextLesson.slug}`}>
                           <Button size="sm" className="gap-1">
                             Keyingi <ChevronRight className="w-4 h-4" />
                           </Button>
                         </Link>
                       ) : (
                         <Button
                           size="sm"
                           variant="outline"
                           className="gap-1"
                           onClick={() => navigate(`/course-payment/${courseSlug}`)}
                         >
                           <Lock className="w-3.5 h-3.5" /> Sotib olish
                         </Button>
                       )
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

            {/* ── Sidebar: lesson list ── */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="rounded-xl border border-border bg-card/50 overflow-hidden sticky top-24">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground">Darslar ({lessons.length})</h3>
                  {hasAccess && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>{completedLessons.size}/{lessons.length} tugallangan</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                    </div>
                  )}
                  {!hasAccess && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Qulflangan darslarni ko'rish uchun kursni sotib oling
                    </p>
                  )}
                </div>
                <ScrollArea className="max-h-[60vh]">
                  <div className="p-2 space-y-1">
                    {lessons.map((lesson, i) => {
                      const isActive = lesson.id === currentLesson?.id;
                      const accessible = canViewLesson(lesson);
                      return (
                        <Link
                          key={lesson.id}
                          to={
                            accessible
                              ? `/course/${courseSlug}/lesson/${lesson.slug}`
                              : `/course-payment/${courseSlug}`
                          }
                          className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                            isActive
                              ? "bg-primary/10 border border-primary/20"
                              : accessible
                              ? "hover:bg-muted/50"
                              : "opacity-50 hover:bg-muted/30"
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {i + 1}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-medium truncate ${
                                isActive ? "text-primary" : "text-foreground"
                              }`}
                            >
                              {lesson.title}
                            </p>
                            {lesson.duration_minutes && (
                              <p className="text-xs text-muted-foreground">
                                {lesson.duration_minutes} daqiqa
                              </p>
                            )}
                          </div>

                          {/* Status icon */}
                          {lesson.is_preview && !hasAccess ? (
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              Bepul
                            </Badge>
                          ) : !hasAccess ? (
                            <Lock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          ) : completedLessons.has(lesson.id) ? (
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          ) : isActive ? (
                            <Play className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
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
