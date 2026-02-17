import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, Save, Upload, Link as LinkIcon, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Material {
  id?: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
}

const AdminCourseLessonForm = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!lessonId;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [videoInputType, setVideoInputType] = useState<"url" | "file">("url");
  const [materials, setMaterials] = useState<Material[]>([]);

  const [formData, setFormData] = useState({
    title: "", slug: "", description: "", content_html: "",
    video_url: "", video_file_url: "", thumbnail_url: "",
    duration_minutes: 0, sort_order: 0, is_preview: false, is_published: false,
  });

  useEffect(() => {
    if (isEditing) fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    setIsLoading(true);
    const { data } = await supabase.from("course_lessons").select("*").eq("id", lessonId).single();
    if (data) {
      setFormData({
        title: data.title || "", slug: data.slug || "",
        description: data.description || "", content_html: data.content_html || "",
        video_url: data.video_url || "", video_file_url: data.video_file_url || "",
        thumbnail_url: data.thumbnail_url || "",
        duration_minutes: data.duration_minutes || 0, sort_order: data.sort_order || 0,
        is_preview: data.is_preview || false, is_published: data.is_published || false,
      });
      if (data.video_file_url) setVideoInputType("file");
    }
    // Fetch materials
    const { data: matData } = await supabase.from("course_lesson_materials").select("*").eq("lesson_id", lessonId).order("sort_order");
    if (matData) setMaterials(matData as Material[]);
    setIsLoading(false);
  };

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();

  const handleTitleChange = (value: string) => {
    setFormData((p) => ({ ...p, title: value, slug: isEditing ? p.slug : generateSlug(value) }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "video" | "thumbnail" | "material") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === "video" && file.size > 100 * 1024 * 1024) { toast.error("Video hajmi 100MB dan oshmasligi kerak"); return; }

    setIsUploading(true);
    const fileName = `${type}-${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from(type === "material" ? "course-materials" : "lesson-videos").upload(fileName, file);

    if (error) {
      toast.error("Yuklashda xatolik");
    } else {
      const bucket = type === "material" ? "course-materials" : "lesson-videos";
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
      if (type === "video") setFormData((p) => ({ ...p, video_file_url: urlData.publicUrl }));
      else if (type === "thumbnail") setFormData((p) => ({ ...p, thumbnail_url: urlData.publicUrl }));
      else setMaterials((prev) => [...prev, { file_name: file.name, file_url: urlData.publicUrl, file_type: file.type, file_size: file.size }]);
      toast.success("Yuklandi");
    }
    setIsUploading(false);
  };

  const removeMaterial = (index: number) => setMaterials((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) { toast.error("Sarlavha majburiy"); return; }
    setIsSaving(true);

    const lessonData = {
      course_id: courseId!,
      title: formData.title,
      slug: formData.slug || generateSlug(formData.title),
      description: formData.description || null,
      content_html: formData.content_html || null,
      video_url: videoInputType === "url" ? formData.video_url || null : null,
      video_file_url: videoInputType === "file" ? formData.video_file_url || null : null,
      thumbnail_url: formData.thumbnail_url || null,
      duration_minutes: formData.duration_minutes || null,
      sort_order: formData.sort_order,
      is_preview: formData.is_preview,
      is_published: formData.is_published,
    };

    let savedLessonId = lessonId;

    if (isEditing) {
      const { error } = await supabase.from("course_lessons").update(lessonData).eq("id", lessonId);
      if (error) { toast.error("Xatolik: " + error.message); setIsSaving(false); return; }
    } else {
      const { data, error } = await supabase.from("course_lessons").insert([lessonData]).select("id").single();
      if (error) { toast.error("Xatolik: " + error.message); setIsSaving(false); return; }
      savedLessonId = data.id;
    }

    // Save materials
    if (savedLessonId) {
      // Delete existing materials and re-insert
      await supabase.from("course_lesson_materials").delete().eq("lesson_id", savedLessonId);
      if (materials.length > 0) {
        const matInsert = materials.map((m, i) => ({
          lesson_id: savedLessonId!,
          file_name: m.file_name,
          file_url: m.file_url,
          file_type: m.file_type,
          file_size: m.file_size,
          sort_order: i,
        }));
        await supabase.from("course_lesson_materials").insert(matInsert);
      }
    }

    // Update course lesson count
    const { count } = await supabase.from("course_lessons").select("*", { count: "exact", head: true }).eq("course_id", courseId);
    await supabase.from("courses").update({ lessons_count: count || 0 }).eq("id", courseId);

    setIsSaving(false);
    toast.success(isEditing ? "Dars yangilandi" : "Dars yaratildi");
    navigate(`/admin/courses/${courseId}/lessons`);
  };

  if (isLoading) return <div className="flex items-center justify-center py-16"><div className="animate-pulse">Yuklanmoqda...</div></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate(`/admin/courses/${courseId}/lessons`)} className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" /> Darslarga qaytish
        </button>
        <h1 className="font-display text-2xl font-bold text-foreground">
          {isEditing ? "Darsni tahrirlash" : "Yangi dars qo'shish"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic info */}
        <div className="bg-card rounded-xl p-6 border border-border space-y-6">
          <h2 className="font-display text-lg font-semibold text-foreground">Asosiy ma'lumotlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><Label>Sarlavha *</Label><Input value={formData.title} onChange={(e) => handleTitleChange(e.target.value)} required /></div>
            <div className="space-y-2"><Label>Slug</Label><Input value={formData.slug} onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))} /></div>
          </div>
          <div className="space-y-2"><Label>Tavsif</Label><Textarea value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} rows={3} /></div>
          <div className="space-y-2"><Label>Kontent</Label><RichTextEditor value={formData.content_html} onChange={(val) => setFormData((p) => ({ ...p, content_html: val }))} placeholder="Dars matni..." /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><Label>Davomiylik (daqiqa)</Label><Input type="number" value={formData.duration_minutes} onChange={(e) => setFormData((p) => ({ ...p, duration_minutes: Number(e.target.value) }))} min={0} /></div>
            <div className="space-y-2"><Label>Tartib raqami</Label><Input type="number" value={formData.sort_order} onChange={(e) => setFormData((p) => ({ ...p, sort_order: Number(e.target.value) }))} /></div>
          </div>
        </div>

        {/* Video */}
        <div className="bg-card rounded-xl p-6 border border-border space-y-6">
          <h2 className="font-display text-lg font-semibold text-foreground">Video</h2>
          <div className="flex gap-4 mb-4">
            <Button type="button" variant={videoInputType === "url" ? "default" : "outline"} onClick={() => setVideoInputType("url")}><LinkIcon className="w-4 h-4 mr-2" />URL</Button>
            <Button type="button" variant={videoInputType === "file" ? "default" : "outline"} onClick={() => setVideoInputType("file")}><Upload className="w-4 h-4 mr-2" />Yuklash</Button>
          </div>
          {videoInputType === "url" ? (
            <div className="space-y-2"><Label>Video URL</Label><Input value={formData.video_url} onChange={(e) => setFormData((p) => ({ ...p, video_url: e.target.value }))} placeholder="https://youtube.com/..." /></div>
          ) : formData.video_file_url ? (
            <div className="flex items-center gap-4"><video src={formData.video_file_url} className="h-32 rounded-lg" controls /><Button type="button" variant="outline" onClick={() => setFormData((p) => ({ ...p, video_file_url: "" }))}>O'chirish</Button></div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center"><input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, "video")} className="hidden" id="vid-upload" disabled={isUploading} /><label htmlFor="vid-upload" className="cursor-pointer text-muted-foreground hover:text-foreground">{isUploading ? "Yuklanmoqda..." : "Video yuklash (max 100MB)"}</label></div>
          )}
          {/* Thumbnail */}
          <div className="space-y-2">
            <Label>Muqova rasmi</Label>
            {formData.thumbnail_url ? (
              <div className="flex items-center gap-4"><img src={formData.thumbnail_url} alt="" className="h-24 rounded-lg object-cover" /><Button type="button" variant="outline" onClick={() => setFormData((p) => ({ ...p, thumbnail_url: "" }))}>O'chirish</Button></div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center"><input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "thumbnail")} className="hidden" id="thumb-upload" disabled={isUploading} /><label htmlFor="thumb-upload" className="cursor-pointer text-muted-foreground hover:text-foreground">{isUploading ? "Yuklanmoqda..." : "Rasm yuklash"}</label></div>
            )}
          </div>
        </div>

        {/* Materials */}
        <div className="bg-card rounded-xl p-6 border border-border space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-foreground">Materiallar</h2>
            <div>
              <input type="file" onChange={(e) => handleFileUpload(e, "material")} className="hidden" id="mat-upload" disabled={isUploading} />
              <label htmlFor="mat-upload">
                <Button type="button" variant="outline" size="sm" asChild><span><Plus className="w-4 h-4 mr-1" />{isUploading ? "Yuklanmoqda..." : "Fayl qo'shish"}</span></Button>
              </label>
            </div>
          </div>
          {materials.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Materiallar qo'shilmagan</p>
          ) : (
            <div className="space-y-2">
              {materials.map((mat, i) => (
                <div key={i} className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{mat.file_name}</p>
                    {mat.file_size && <p className="text-xs text-muted-foreground">{(mat.file_size / 1024).toFixed(1)} KB</p>}
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeMaterial(i)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Publish options */}
        <div className="bg-card rounded-xl p-6 border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div><Label>Bepul ko'rish (Preview)</Label><p className="text-sm text-muted-foreground">Sotib olmasdan ko'rish mumkin</p></div>
            <Switch checked={formData.is_preview} onCheckedChange={(c) => setFormData((p) => ({ ...p, is_preview: c }))} />
          </div>
          <div className="flex items-center justify-between">
            <div><Label>Nashr holati</Label><p className="text-sm text-muted-foreground">Darsni ko'rinadigan qilish</p></div>
            <Switch checked={formData.is_published} onCheckedChange={(c) => setFormData((p) => ({ ...p, is_published: c }))} />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(`/admin/courses/${courseId}/lessons`)}>Bekor qilish</Button>
          <Button type="submit" disabled={isSaving || isUploading}><Save className="w-4 h-4 mr-2" />{isSaving ? "Saqlanmoqda..." : "Saqlash"}</Button>
        </div>
      </form>
    </div>
  );
};

export default AdminCourseLessonForm;
