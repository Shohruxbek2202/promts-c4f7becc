import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, Save, Upload, Trash2, FileIcon } from "lucide-react";
import { toast } from "sonner";

interface Category { id: string; name: string; slug: string; }

interface GuideFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  sort_order: number;
}

const AdminGuideForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [savedGuideId, setSavedGuideId] = useState<string | null>(id || null);
  const [files, setFiles] = useState<GuideFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "", slug: "", description: "", content_html: "",
    category_id: "", cover_image_url: "",
    is_premium: false, price: 0, is_published: true,
  });

  useEffect(() => {
    fetchCategories();
    if (isEditing) { fetchGuide(); fetchFiles(); }
  }, [id]);

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("id, name, slug").eq("is_active", true).order("sort_order");
    if (data) setCategories(data);
  };

  const fetchGuide = async () => {
    setIsLoading(true);
    const { data } = await supabase.from("guides").select("*").eq("id", id).single();
    if (data) {
      setFormData({
        title: data.title || "", slug: data.slug || "", description: data.description || "",
        content_html: data.content_html || "", category_id: data.category_id || "",
        cover_image_url: data.cover_image_url || "",
        is_premium: data.is_premium || false, price: data.price || 0,
        is_published: data.is_published ?? true,
      });
      setSavedGuideId(data.id);
    }
    setIsLoading(false);
  };

  const fetchFiles = async () => {
    if (!id) return;
    const { data } = await supabase.from("guide_files").select("*").eq("guide_id", id).order("sort_order");
    if (data) setFiles(data as GuideFile[]);
  };

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({ ...prev, title: value, slug: isEditing ? prev.slug : generateSlug(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) { toast.error("Sarlavha majburiy"); return; }
    setIsSaving(true);

    const guideData = {
      title: formData.title, slug: formData.slug, description: formData.description,
      content_html: formData.content_html, category_id: formData.category_id || null,
      cover_image_url: formData.cover_image_url || null,
      is_premium: formData.is_premium, price: Number(formData.price),
      is_published: formData.is_published,
    };

    let error;
    let newId: string | null = null;
    if (isEditing) {
      const result = await supabase.from("guides").update(guideData).eq("id", id);
      error = result.error;
    } else {
      const result = await supabase.from("guides").insert([guideData]).select("id").single();
      error = result.error;
      if (result.data) { newId = result.data.id; setSavedGuideId(result.data.id); }
    }

    setIsSaving(false);
    if (error) { toast.error("Xatolik: " + error.message); }
    else {
      toast.success(isEditing ? "Qo'llanma yangilandi" : "Qo'llanma yaratildi");
      if (!isEditing && newId) navigate(`/admin/guides/${newId}/edit`);
      else navigate("/admin/guides");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!savedGuideId || !e.target.files?.length) return;
    setIsUploading(true);
    
    for (const file of Array.from(e.target.files)) {
      const ext = file.name.split(".").pop();
      const path = `${savedGuideId}/${Date.now()}.${ext}`;
      
      const { error: uploadError } = await supabase.storage.from("guide-files").upload(path, file);
      if (uploadError) { toast.error(`Yuklashda xatolik: ${file.name}`); continue; }

      const { data: { publicUrl } } = supabase.storage.from("guide-files").getPublicUrl(path);

      await supabase.from("guide_files").insert({
        guide_id: savedGuideId,
        file_name: file.name,
        file_url: publicUrl,
        file_type: file.type,
        file_size: file.size,
        sort_order: files.length,
      });
    }

    toast.success("Fayllar yuklandi");
    fetchFiles();
    setIsUploading(false);
    e.target.value = "";
  };

  const handleDeleteFile = async (fileId: string, fileUrl: string) => {
    // Extract path from URL
    const urlParts = fileUrl.split("/guide-files/");
    if (urlParts[1]) {
      await supabase.storage.from("guide-files").remove([urlParts[1]]);
    }
    await supabase.from("guide_files").delete().eq("id", fileId);
    toast.success("Fayl o'chirildi");
    fetchFiles();
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><div className="animate-pulse">Yuklanmoqda...</div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate("/admin/guides")} className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" />Qo'llanmalarga qaytish
        </button>
        <h1 className="font-display text-2xl font-bold text-foreground">
          {isEditing ? "Qo'llanmani tahrirlash" : "Yangi qo'llanma qo'shish"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic info */}
        <div className="bg-card rounded-xl p-6 border border-border space-y-6">
          <h2 className="font-display text-lg font-semibold text-foreground">Asosiy ma'lumotlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Sarlavha *</Label>
              <Input value={formData.title} onChange={e => handleTitleChange(e.target.value)} placeholder="Qo'llanma sarlavhasi" required />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={formData.slug} onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))} placeholder="qollanma-slug" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Qisqa tavsif</Label>
            <Textarea value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Qo'llanma haqida qisqa ma'lumot" rows={2} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Kategoriya</Label>
              <Select value={formData.category_id} onValueChange={v => setFormData(prev => ({ ...prev, category_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Kategoriya tanlang" /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Muqova rasm URL (ixtiyoriy)</Label>
              <Input value={formData.cover_image_url} onChange={e => setFormData(prev => ({ ...prev, cover_image_url: e.target.value }))} placeholder="https://..." />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-card rounded-xl p-6 border border-border space-y-6">
          <h2 className="font-display text-lg font-semibold text-foreground">Kontent</h2>
          <RichTextEditor value={formData.content_html} onChange={val => setFormData(prev => ({ ...prev, content_html: val }))} placeholder="Qo'llanma matni..." />
        </div>

        {/* Files */}
        {savedGuideId && (
          <div className="bg-card rounded-xl p-6 border border-border space-y-6">
            <h2 className="font-display text-lg font-semibold text-foreground">Fayllar</h2>
            <p className="text-sm text-muted-foreground">PDF, Word, rasm va boshqa fayllarni yuklang</p>
            
            <div>
              <Label htmlFor="file-upload" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-border hover:border-primary transition-colors">
                <Upload className="w-4 h-4" />
                {isUploading ? "Yuklanmoqda..." : "Fayl yuklash"}
              </Label>
              <input id="file-upload" type="file" multiple className="hidden" onChange={handleFileUpload} disabled={isUploading} />
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                {files.map(file => (
                  <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <FileIcon className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-foreground hover:text-primary truncate block">
                        {file.file_name}
                      </a>
                      <p className="text-xs text-muted-foreground">{file.file_type} • {formatFileSize(file.file_size)}</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleDeleteFile(file.id, file.file_url)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pricing */}
        <div className="bg-card rounded-xl p-6 border border-border space-y-6">
          <h2 className="font-display text-lg font-semibold text-foreground">Narx va mavjudlik</h2>
          <div className="flex items-center justify-between">
            <div>
              <Label>Pulli qo'llanma</Label>
              <p className="text-sm text-muted-foreground">Faqat obunachi yoki sotib olganlar uchun</p>
            </div>
            <Switch checked={formData.is_premium} onCheckedChange={c => setFormData(prev => ({ ...prev, is_premium: c }))} />
          </div>
          {formData.is_premium && (
            <div className="space-y-2">
              <Label>Narx (so'm)</Label>
              <Input type="number" value={formData.price} onChange={e => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))} />
            </div>
          )}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div>
              <Label>Nashr holati</Label>
              <p className="text-sm text-muted-foreground">Omma uchun ko'rinadigan qilish</p>
            </div>
            <Switch checked={formData.is_published} onCheckedChange={c => setFormData(prev => ({ ...prev, is_published: c }))} />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate("/admin/guides")}>Bekor qilish</Button>
          <Button type="submit" disabled={isSaving}><Save className="w-4 h-4 mr-2" />{isSaving ? "Saqlanmoqda..." : "Saqlash"}</Button>
        </div>
      </form>
    </div>
  );
};

export default AdminGuideForm;
