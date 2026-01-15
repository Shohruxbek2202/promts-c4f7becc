import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, Save, Upload, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
}

const AdminLessonForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [videoInputType, setVideoInputType] = useState<"url" | "file">("url");

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    video_url: "",
    video_file_url: "",
    thumbnail_url: "",
    category_id: "",
    duration_minutes: 0,
    sort_order: 0,
    is_published: false,
  });

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchLesson();
    }
  }, [id]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("id, name")
      .eq("is_active", true)
      .order("sort_order");
    
    if (data) setCategories(data);
  };

  const fetchLesson = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      setFormData({
        title: data.title || "",
        slug: data.slug || "",
        description: data.description || "",
        video_url: data.video_url || "",
        video_file_url: data.video_file_url || "",
        thumbnail_url: data.thumbnail_url || "",
        category_id: data.category_id || "",
        duration_minutes: data.duration_minutes || 0,
        sort_order: data.sort_order || 0,
        is_published: data.is_published || false,
      });
      if (data.video_file_url) {
        setVideoInputType("file");
      }
    }
    setIsLoading(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      title: value,
      slug: isEditing ? prev.slug : generateSlug(value),
    }));
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error("Video hajmi 100MB dan oshmasligi kerak");
      return;
    }

    setIsUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("lesson-videos")
      .upload(fileName, file);

    if (error) {
      toast.error("Video yuklashda xatolik");
      console.error(error);
    } else {
      const { data: urlData } = supabase.storage
        .from("lesson-videos")
        .getPublicUrl(fileName);
      
      setFormData(prev => ({ ...prev, video_file_url: urlData.publicUrl }));
      toast.success("Video yuklandi");
    }
    setIsUploading(false);
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `thumbnail-${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("lesson-videos")
      .upload(fileName, file);

    if (error) {
      toast.error("Rasm yuklashda xatolik");
    } else {
      const { data: urlData } = supabase.storage
        .from("lesson-videos")
        .getPublicUrl(fileName);
      
      setFormData(prev => ({ ...prev, thumbnail_url: urlData.publicUrl }));
      toast.success("Rasm yuklandi");
    }
    setIsUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast.error("Sarlavha majburiy");
      return;
    }

    setIsSaving(true);

    const lessonData = {
      title: formData.title,
      slug: formData.slug || generateSlug(formData.title),
      description: formData.description || null,
      video_url: videoInputType === "url" ? formData.video_url || null : null,
      video_file_url: videoInputType === "file" ? formData.video_file_url || null : null,
      thumbnail_url: formData.thumbnail_url || null,
      category_id: formData.category_id || null,
      duration_minutes: formData.duration_minutes || null,
      sort_order: formData.sort_order,
      is_published: formData.is_published,
    };

    let error;

    if (isEditing) {
      const result = await supabase
        .from("lessons")
        .update(lessonData)
        .eq("id", id);
      error = result.error;
    } else {
      const result = await supabase
        .from("lessons")
        .insert([lessonData]);
      error = result.error;
    }

    setIsSaving(false);

    if (error) {
      toast.error("Xatolik yuz berdi: " + error.message);
    } else {
      toast.success(isEditing ? "Dars yangilandi" : "Dars yaratildi");
      navigate("/admin/lessons");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-pulse">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin/lessons")}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Darslarga qaytish
        </button>
        <h1 className="font-display text-2xl font-bold text-foreground">
          {isEditing ? "Darsni tahrirlash" : "Yangi dars qo'shish"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-card rounded-xl p-6 border border-border space-y-6">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Asosiy ma'lumotlar
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Sarlavha *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Dars sarlavhasi"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="dars-slug"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Tavsif</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Dars haqida qisqa ma'lumot"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Kategoriya</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategoriya tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Davomiylik (daqiqa)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: Number(e.target.value) }))}
                placeholder="0"
                min={0}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort_order">Tartib raqami</Label>
              <Input
                id="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData(prev => ({ ...prev, sort_order: Number(e.target.value) }))}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Video */}
        <div className="bg-card rounded-xl p-6 border border-border space-y-6">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Video
          </h2>

          <div className="flex gap-4 mb-4">
            <Button
              type="button"
              variant={videoInputType === "url" ? "default" : "outline"}
              onClick={() => setVideoInputType("url")}
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              URL orqali
            </Button>
            <Button
              type="button"
              variant={videoInputType === "file" ? "default" : "outline"}
              onClick={() => setVideoInputType("file")}
            >
              <Upload className="w-4 h-4 mr-2" />
              Yuklash
            </Button>
          </div>

          {videoInputType === "url" ? (
            <div className="space-y-2">
              <Label htmlFor="video_url">Video URL (YouTube, Vimeo, etc.)</Label>
              <Input
                id="video_url"
                value={formData.video_url}
                onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Video fayl</Label>
              {formData.video_file_url ? (
                <div className="flex items-center gap-4">
                  <video
                    src={formData.video_file_url}
                    className="h-32 rounded-lg"
                    controls
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormData(prev => ({ ...prev, video_file_url: "" }))}
                  >
                    O'chirish
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="video-upload"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="video-upload"
                    className="cursor-pointer text-muted-foreground hover:text-foreground"
                  >
                    {isUploading ? "Yuklanmoqda..." : "Video yuklash (max 100MB)"}
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Thumbnail */}
          <div className="space-y-2">
            <Label>Muqova rasmi</Label>
            {formData.thumbnail_url ? (
              <div className="flex items-center gap-4">
                <img
                  src={formData.thumbnail_url}
                  alt="Thumbnail"
                  className="h-24 rounded-lg object-cover"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData(prev => ({ ...prev, thumbnail_url: "" }))}
                >
                  O'chirish
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                  id="thumbnail-upload"
                  disabled={isUploading}
                />
                <label
                  htmlFor="thumbnail-upload"
                  className="cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  {isUploading ? "Yuklanmoqda..." : "Rasm yuklash"}
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Publish */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <Label>Nashr holati</Label>
              <p className="text-sm text-muted-foreground">
                Darsni omma uchun ko'rinadigan qilish
              </p>
            </div>
            <Switch
              checked={formData.is_published}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/lessons")}
          >
            Bekor qilish
          </Button>
          <Button type="submit" disabled={isSaving || isUploading}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminLessonForm;
