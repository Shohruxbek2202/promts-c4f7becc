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
import { ChevronLeft, Save, Upload } from "lucide-react";
import { toast } from "sonner";

interface Category { id: string; name: string; }

const AdminCourseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    title: "", slug: "", description: "", content_html: "",
    cover_image_url: "", instructor_name: "", instructor_bio: "",
    instructor_avatar_url: "", price: 0, discount_price: null as number | null,
    category_id: "", duration_minutes: 0, sort_order: 0, is_published: false,
    chat_room_icon: "📚", show_on_landing: false,
  });

  useEffect(() => {
    fetchCategories();
    if (isEditing) fetchCourse();
  }, [id]);

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("id, name").eq("is_active", true).order("sort_order");
    if (data) setCategories(data);
  };

  const fetchCourse = async () => {
    setIsLoading(true);
    const { data } = await supabase.from("courses").select("*").eq("id", id).single();
    if (data) {
      setFormData({
        title: data.title || "", slug: data.slug || "",
        description: data.description || "", content_html: data.content_html || "",
        cover_image_url: data.cover_image_url || "",
        instructor_name: data.instructor_name || "", instructor_bio: data.instructor_bio || "",
        instructor_avatar_url: data.instructor_avatar_url || "",
        price: data.price || 0, discount_price: data.discount_price || null,
        category_id: data.category_id || "", duration_minutes: data.duration_minutes || 0,
        sort_order: data.sort_order || 0, is_published: data.is_published || false,
        chat_room_icon: (data as any).chat_room_icon || "📚",
        show_on_landing: (data as any).show_on_landing || false,
      });
    }
    setIsLoading(false);
  };

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, title: value, slug: isEditing ? prev.slug : generateSlug(value) }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "cover_image_url" | "instructor_avatar_url") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const fileName = `course-${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("course-materials").upload(fileName, file);
    if (error) {
      toast.error("Rasm yuklashda xatolik");
    } else {
      const { data: urlData } = supabase.storage.from("course-materials").getPublicUrl(fileName);
      setFormData((prev) => ({ ...prev, [field]: urlData.publicUrl }));
      toast.success("Rasm yuklandi");
    }
    setIsUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) { toast.error("Sarlavha majburiy"); return; }
    setIsSaving(true);

    const courseData = {
      title: formData.title,
      slug: formData.slug || generateSlug(formData.title),
      description: formData.description || null,
      content_html: formData.content_html || null,
      cover_image_url: formData.cover_image_url || null,
      instructor_name: formData.instructor_name || null,
      instructor_bio: formData.instructor_bio || null,
      instructor_avatar_url: formData.instructor_avatar_url || null,
      price: formData.price, discount_price: formData.discount_price,
      category_id: formData.category_id || null,
      duration_minutes: formData.duration_minutes || null,
      sort_order: formData.sort_order, is_published: formData.is_published,
      chat_room_icon: formData.chat_room_icon || "📚",
      show_on_landing: formData.show_on_landing,
    } as any;

    const { error } = isEditing
      ? await supabase.from("courses").update(courseData).eq("id", id)
      : await supabase.from("courses").insert([courseData]);

    setIsSaving(false);
    if (error) {
      toast.error("Xatolik: " + error.message);
    } else {
      toast.success(isEditing ? "Kurs yangilandi" : "Kurs yaratildi");
      navigate("/admin/courses");
    }
  };

  if (isLoading) return <div className="flex items-center justify-center py-16"><div className="animate-pulse">Yuklanmoqda...</div></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate("/admin/courses")} className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" /> Kurslarga qaytish
        </button>
        <h1 className="font-display text-2xl font-bold text-foreground">
          {isEditing ? "Kursni tahrirlash" : "Yangi kurs qo'shish"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Asosiy ma'lumotlar */}
        <div className="bg-card rounded-xl p-6 border border-border space-y-6">
          <h2 className="font-display text-lg font-semibold text-foreground">Asosiy ma'lumotlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Sarlavha *</Label>
              <Input id="title" value={formData.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Kurs nomi" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={formData.slug} onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))} placeholder="kurs-slug" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Qisqacha tavsif</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} placeholder="Kurs haqida qisqa ma'lumot" rows={3} />
          </div>
          <div className="space-y-2">
            <Label>To'liq tavsif</Label>
            <RichTextEditor value={formData.content_html} onChange={(val) => setFormData((p) => ({ ...p, content_html: val }))} placeholder="Kurs haqida to'liq ma'lumot..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Kategoriya</Label>
              <Select value={formData.category_id} onValueChange={(v) => setFormData((p) => ({ ...p, category_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                <SelectContent>{categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Davomiylik (daqiqa)</Label>
              <Input type="number" value={formData.duration_minutes} onChange={(e) => setFormData((p) => ({ ...p, duration_minutes: Number(e.target.value) }))} min={0} />
            </div>
            <div className="space-y-2">
              <Label>Tartib raqami</Label>
              <Input type="number" value={formData.sort_order} onChange={(e) => setFormData((p) => ({ ...p, sort_order: Number(e.target.value) }))} />
            </div>
          </div>
        </div>

        {/* Narx */}
        <div className="bg-card rounded-xl p-6 border border-border space-y-6">
          <h2 className="font-display text-lg font-semibold text-foreground">Narx</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Narxi (so'm) *</Label>
              <Input type="number" value={formData.price} onChange={(e) => setFormData((p) => ({ ...p, price: Number(e.target.value) }))} min={0} />
            </div>
            <div className="space-y-2">
              <Label>Chegirmali narx (so'm)</Label>
              <Input type="number" value={formData.discount_price ?? ""} onChange={(e) => setFormData((p) => ({ ...p, discount_price: e.target.value ? Number(e.target.value) : null }))} min={0} placeholder="Bo'sh qoldiring" />
            </div>
          </div>
        </div>

        {/* Cover */}
        <div className="bg-card rounded-xl p-6 border border-border space-y-6">
          <h2 className="font-display text-lg font-semibold text-foreground">Muqova rasmi</h2>
          {formData.cover_image_url ? (
            <div className="flex items-center gap-4">
              <img src={formData.cover_image_url} alt="Cover" className="h-32 rounded-lg object-cover" />
              <Button type="button" variant="outline" onClick={() => setFormData((p) => ({ ...p, cover_image_url: "" }))}>O'chirish</Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "cover_image_url")} className="hidden" id="cover-upload" disabled={isUploading} />
              <label htmlFor="cover-upload" className="cursor-pointer text-muted-foreground hover:text-foreground flex items-center justify-center gap-2">
                <Upload className="w-5 h-5" /> {isUploading ? "Yuklanmoqda..." : "Rasm yuklash"}
              </label>
            </div>
          )}
        </div>

        {/* O'qituvchi */}
        <div className="bg-card rounded-xl p-6 border border-border space-y-6">
          <h2 className="font-display text-lg font-semibold text-foreground">O'qituvchi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Ismi</Label>
              <Input value={formData.instructor_name} onChange={(e) => setFormData((p) => ({ ...p, instructor_name: e.target.value }))} placeholder="O'qituvchi ismi" />
            </div>
            <div className="space-y-2">
              <Label>Avatar</Label>
              {formData.instructor_avatar_url ? (
                <div className="flex items-center gap-3">
                  <img src={formData.instructor_avatar_url} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
                  <Button type="button" variant="outline" size="sm" onClick={() => setFormData((p) => ({ ...p, instructor_avatar_url: "" }))}>O'chirish</Button>
                </div>
              ) : (
                <>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "instructor_avatar_url")} className="hidden" id="avatar-upload" disabled={isUploading} />
                  <label htmlFor="avatar-upload" className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">{isUploading ? "Yuklanmoqda..." : "Avatar yuklash"}</label>
                </>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Haqida</Label>
            <Textarea value={formData.instructor_bio} onChange={(e) => setFormData((p) => ({ ...p, instructor_bio: e.target.value }))} placeholder="O'qituvchi haqida" rows={3} />
          </div>
        </div>

        {/* Chat xonasi */}
        <div className="bg-card rounded-xl p-6 border border-border space-y-4">
          <h2 className="font-display text-lg font-semibold text-foreground">Chat xonasi</h2>
          <p className="text-sm text-muted-foreground">Kurs yaratilganda avtomatik chat xonasi ochiladi. Ikonka kurs chatida ko'rinadi.</p>
          <div className="space-y-2">
            <Label>Chat ikonkasi (emoji)</Label>
            <Input 
              value={formData.chat_room_icon} 
              onChange={(e) => setFormData((p) => ({ ...p, chat_room_icon: e.target.value }))} 
              placeholder="📚" 
              className="w-24 text-center text-xl"
            />
          </div>
        </div>

        {/* Nashr */}
        <div className="bg-card rounded-xl p-6 border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Nashr holati</Label>
              <p className="text-sm text-muted-foreground">Kursni omma uchun ko'rinadigan qilish</p>
            </div>
            <Switch checked={formData.is_published} onCheckedChange={(c) => setFormData((p) => ({ ...p, is_published: c }))} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Bosh sahifada ko'rsatish</Label>
              <p className="text-sm text-muted-foreground">Kursni bosh sahifadagi vitrinada chiqarish</p>
            </div>
            <Switch checked={formData.show_on_landing} onCheckedChange={(c) => setFormData((p) => ({ ...p, show_on_landing: c }))} />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate("/admin/courses")}>Bekor qilish</Button>
          <Button type="submit" disabled={isSaving || isUploading}>
            <Save className="w-4 h-4 mr-2" /> {isSaving ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminCourseForm;
