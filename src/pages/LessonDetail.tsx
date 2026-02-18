import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Play,
  Lock,
  Clock,
  ChevronLeft,
  BookOpen
} from "lucide-react";
import { SEOHead, SchemaMarkup, VideoSchema, Breadcrumb } from "@/components/seo";

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
    name: string;
  };
}

const LessonDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [signedVideoUrl, setSignedVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchLesson();
    if (user) {
      checkAccess();
    }
  }, [slug, user]);

  // Fetch signed URL for private video files
  useEffect(() => {
    if (!lesson?.video_file_url || !user || !hasAccess) { setSignedVideoUrl(null); return; }
    const url = lesson.video_file_url;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      setSignedVideoUrl(url);
      return;
    }
    supabase.functions.invoke("get-video-url", {
      body: { filePath: url, bucket: "lesson-videos" },
    }).then(({ data }) => {
      if (data?.signedUrl) setSignedVideoUrl(data.signedUrl);
    });
  }, [lesson?.video_file_url, user, hasAccess]);

  const fetchLesson = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("lessons")
      .select(`
        id, title, slug, description, video_url, video_file_url,
        thumbnail_url, duration_minutes,
        categories (name)
      `)
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (data) {
      setLesson(data as unknown as Lesson);
    } else {
      navigate("/lessons");
    }
    setIsLoading(false);
  };

  const checkAccess = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_type, subscription_expires_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile) {
      const hasValidSubscription = 
        profile.subscription_type && 
        profile.subscription_type !== "free" &&
        (!profile.subscription_expires_at || new Date(profile.subscription_expires_at) > new Date());
      
      setHasAccess(!!hasValidSubscription);
    }
  };

  const getVideoEmbed = () => {
    if (!lesson) return null;

    // If there's an uploaded video file — use signed URL for private bucket
    if (lesson.video_file_url) {
      if (!signedVideoUrl) {
        return <div className="w-full aspect-video rounded-xl bg-muted flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
      }
      return (
        <video
          src={signedVideoUrl}
          controls
          controlsList="nodownload noremoteplayback"
          className="w-full aspect-video rounded-xl"
          poster={lesson.thumbnail_url || undefined}
          onContextMenu={(e) => e.preventDefault()}
        />
      );
    }

    // If there's a video URL (YouTube, Vimeo, etc.)
    if (lesson.video_url) {
      // YouTube
      if (lesson.video_url.includes("youtube.com") || lesson.video_url.includes("youtu.be")) {
        const videoId = lesson.video_url.includes("youtu.be")
          ? lesson.video_url.split("/").pop()
          : new URL(lesson.video_url).searchParams.get("v");
        
        return (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="w-full aspect-video rounded-xl"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        );
      }

      // Vimeo
      if (lesson.video_url.includes("vimeo.com")) {
        const videoId = lesson.video_url.split("/").pop();
        return (
          <iframe
            src={`https://player.vimeo.com/video/${videoId}`}
            className="w-full aspect-video rounded-xl"
            allowFullScreen
          />
        );
      }

      // Generic video URL
      return (
        <video
          src={lesson.video_url}
          controls
          className="w-full aspect-video rounded-xl"
          poster={lesson.thumbnail_url || undefined}
        />
      );
    }

    return (
      <div className="w-full aspect-video rounded-xl bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">Video mavjud emas</p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto animate-pulse">
              <div className="h-8 bg-muted rounded w-1/4 mb-4" />
              <div className="aspect-video bg-muted rounded-xl mb-6" />
              <div className="h-10 bg-muted rounded w-3/4 mb-4" />
              <div className="h-4 bg-muted rounded w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!lesson) return null;

  // SEO Schema
  const videoSchema: VideoSchema = {
    type: "VideoObject",
    name: lesson.title,
    description: lesson.description || `${lesson.title} - marketing darsi`,
    thumbnailUrl: lesson.thumbnail_url || undefined,
    uploadDate: new Date().toISOString(),
    duration: lesson.duration_minutes ? `PT${lesson.duration_minutes}M` : undefined,
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${lesson.title} - Video Dars`}
        description={lesson.description || `${lesson.title} - marketing va AI bo'yicha amaliy video dars.`}
        keywords={["video dars", lesson.title, lesson.categories?.name || "marketing", "o'rganish"]}
        canonicalUrl={`https://mpbs.uz/lessons/${lesson.slug}`}
      />
      <SchemaMarkup schemas={[videoSchema]} />
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* Breadcrumb */}
            <Breadcrumb 
              items={[
                { label: "Darslar", href: "/lessons" },
                { label: lesson.title }
              ]} 
              className="mb-6" 
            />

            {/* Video Player or Locked State */}
            {hasAccess ? (
              <div className="mb-8">
                {getVideoEmbed()}
              </div>
            ) : (
              <div className="relative mb-8">
                <div className="aspect-video rounded-xl overflow-hidden">
                  {lesson.thumbnail_url ? (
                    <img
                      src={lesson.thumbnail_url}
                      alt={lesson.title}
                      className="w-full h-full object-cover blur-sm"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
                  )}
                </div>
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-xl">
                  <Lock className="w-16 h-16 text-white mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Bu dars premium foydalanuvchilar uchun
                  </h3>
                  <p className="text-white/70 mb-6 text-center max-w-md">
                    Barcha video darslardan foydalanish uchun obuna bo'ling
                  </p>
                  <Link to="/payment">
                    <Button size="lg">
                      <Play className="w-4 h-4 mr-2" />
                      Obuna bo'lish
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Lesson Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {lesson.categories && (
                  <Badge variant="outline">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {lesson.categories.name}
                  </Badge>
                )}
                {lesson.duration_minutes && (
                  <Badge variant="secondary">
                    <Clock className="w-3 h-3 mr-1" />
                    {lesson.duration_minutes} daqiqa
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {lesson.title}
              </h1>

              {lesson.description && (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {lesson.description}
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LessonDetail;
