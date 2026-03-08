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
import { Lock, ChevronLeft, Eye, FileIcon, Download, BookOpen, Loader2 } from "lucide-react";
import { SEOHead, Breadcrumb } from "@/components/seo";
import DOMPurify from "dompurify";

interface Category { id: string; name: string; slug: string; }
interface GuideFile {
  id: string; file_name: string; file_url: string;
  file_type: string | null; file_size: number | null;
}
interface Guide {
  id: string; title: string; slug: string; description: string | null;
  content_html: string | null; is_premium: boolean; price: number;
  view_count: number; cover_image_url: string | null;
  categories?: Category;
}

const GuideDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [files, setFiles] = useState<GuideFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [signedFileUrls, setSignedFileUrls] = useState<Record<string, string>>({});
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);

  useEffect(() => { if (slug) fetchGuide(); }, [slug]);
  useEffect(() => {
    if (guide && user) checkAccess();
    else if (guide && !guide.is_premium) setHasAccess(true);
  }, [guide, user]);

  const fetchGuide = async () => {
    setIsLoading(true);
    const { data } = await supabase.from("guides")
      .select(`*, categories (id, name, slug)`)
      .eq("slug", slug).eq("is_published", true).maybeSingle();
    if (data) {
      setGuide(data as Guide);
      const { data: filesData } = await supabase.from("guide_files")
        .select("*").eq("guide_id", data.id).order("sort_order");
      if (filesData) setFiles(filesData as GuideFile[]);
      // Increment view atomically
      await supabase.rpc("increment_guide_view_count", { p_guide_id: data.id });
    }
    setIsLoading(false);
  };

  const checkAccess = async () => {
    if (!guide || !user) return;
    if (!guide.is_premium) { setHasAccess(true); return; }
    const { data: profile } = await supabase.from("profiles")
      .select("subscription_type, subscription_expires_at")
      .eq("user_id", user.id).maybeSingle();
    if (profile) {
      const active = profile.subscription_type !== "free" &&
        (!profile.subscription_expires_at || new Date(profile.subscription_expires_at) > new Date());
      if (active) { setHasAccess(true); return; }
    }
    const { data: purchased } = await supabase.from("user_guides")
      .select("id").eq("user_id", user.id).eq("guide_id", guide.id).maybeSingle();
    setHasAccess(!!purchased);
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleFileDownload = async (file: GuideFile) => {
    if (!guide) return;
    // Check if we already have a signed URL
    if (signedFileUrls[file.id]) {
      window.open(signedFileUrls[file.id], "_blank");
      return;
    }
    setLoadingFileId(file.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Fayl yuklab olish uchun tizimga kiring");
        return;
      }
      const { data, error } = await supabase.functions.invoke("get-guide-file-url", {
        body: { fileUrl: file.file_url, guideId: guide.id },
      });
      if (error || !data?.signedUrl) {
        toast.error("Faylni yuklab olishda xatolik");
        return;
      }
      setSignedFileUrls(prev => ({ ...prev, [file.id]: data.signedUrl }));
      window.open(data.signedUrl, "_blank");
    } catch {
      toast.error("Faylni yuklab olishda xatolik");
    } finally {
      setLoadingFileId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background"><Header />
        <main className="pt-24 pb-16"><div className="container mx-auto px-4"><div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-8 bg-muted rounded w-1/2 mb-4" /><div className="h-4 bg-muted rounded w-3/4 mb-8" /><div className="h-64 bg-muted rounded" />
        </div></div></main></div>
    );
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-background"><Header />
        <main className="pt-24 pb-16"><div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-2xl font-bold mb-4">Qo'llanma topilmadi</h1>
          <Link to="/guides"><Button variant="outline"><ChevronLeft className="w-4 h-4 mr-2" />Qo'llanmalarga qaytish</Button></Link>
        </div></main></div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={guide.title} description={guide.description || `${guide.title} - MPBS.uz qo'llanma`} keywords={["qo'llanma", guide.title, guide.categories?.name || ""]} canonicalUrl={`https://mpbs.uz/guides/${guide.slug}`} />
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Breadcrumb items={[
              { label: "Qo'llanmalar", href: "/guides" },
              ...(guide.categories ? [{ label: guide.categories.name, href: `/guides?category=${guide.categories.slug}` }] : []),
              { label: guide.title }
            ]} className="mb-6" />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {guide.categories && <Link to={`/guides?category=${guide.categories.slug}`}><Badge variant="outline">{guide.categories.name}</Badge></Link>}
                {guide.is_premium ? (
                  <Badge variant="secondary" className="gap-1"><Lock className="w-3 h-3" />Premium - {guide.price?.toLocaleString()} so'm</Badge>
                ) : (
                  <Badge variant="outline" className="text-primary border-primary/30">Bepul</Badge>
                )}
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">{guide.title}</h1>
              {guide.description && <p className="text-lg text-muted-foreground mb-4">{guide.description}</p>}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{guide.view_count} ko'rildi</span>
              </div>
            </motion.div>

            {guide.cover_image_url && (
              <div className="rounded-2xl overflow-hidden mb-8">
                <img src={guide.cover_image_url} alt={guide.title} className="w-full h-auto" />
              </div>
            )}

            {hasAccess ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
                {guide.content_html && (
                  <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-border bg-muted/30">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <span className="font-medium">Qo'llanma haqida batafsil</span>
                    </div>
                    <div className="p-6 prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(guide.content_html) }} />
                  </div>
                )}

                {files.length > 0 && (
                  <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-border bg-muted/30">
                      <FileIcon className="w-5 h-5 text-primary" />
                      <span className="font-medium">Fayllar ({files.length})</span>
                    </div>
                    <div className="p-6 space-y-3">
                      {files.map(file => (
                        <button key={file.id} onClick={() => handleFileDownload(file)}
                          disabled={loadingFileId === file.id}
                          className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors text-left">
                          <FileIcon className="w-5 h-5 text-primary shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{file.file_name}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(file.file_size)}</p>
                          </div>
                          {loadingFileId === file.id ? (
                            <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                          ) : (
                            <Download className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="bg-card rounded-2xl border border-border p-12 text-center">
                <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-lg font-semibold mb-2">Premium kontent</h3>
                <p className="text-muted-foreground mb-6">Bu qo'llanmani ko'rish uchun obuna bo'ling yoki sotib oling</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {!user ? (
                    <Link to="/auth"><Button>Ro'yxatdan o'tish</Button></Link>
                  ) : (
                    <Link to="/payment"><Button>Obuna bo'lish</Button></Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GuideDetail;
