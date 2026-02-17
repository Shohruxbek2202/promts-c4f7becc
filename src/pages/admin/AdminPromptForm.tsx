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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { PromptMediaManager } from "@/components/admin/PromptMediaManager";

interface Category {
  id: string;
  name: string;
  slug: string;
}

const AdminPromptForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [savedPromptId, setSavedPromptId] = useState<string | null>(id || null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    content: "",
    instructions: "",
    instructions_video_url: "",
    examples: "",
    category_id: "",
    difficulty: "beginner",
    is_premium: false,
    is_agency_only: false,
    price: 0,
    seo_title: "",
    seo_description: "",
    is_published: true,
  });

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchPrompt();
    }
  }, [id]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("sort_order");
    
    if (data) setCategories(data);
  };

  const fetchPrompt = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      setFormData({
        title: data.title || "",
        slug: data.slug || "",
        description: data.description || "",
        content: data.content || "",
        instructions: data.instructions || "",
        instructions_video_url: "",
        examples: data.examples || "",
        category_id: data.category_id || "",
        difficulty: data.difficulty || "beginner",
        is_premium: data.is_premium || false,
        is_agency_only: data.is_agency_only || false,
        price: data.price || 0,
        seo_title: data.seo_title || "",
        seo_description: data.seo_description || "",
        is_published: data.is_published ?? true,
      });
      setSavedPromptId(data.id);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast.error("Sarlavha va promt matni majburiy");
      return;
    }

    setIsSaving(true);

    const promptData = {
      title: formData.title,
      slug: formData.slug,
      description: formData.description,
      content: formData.content,
      instructions: formData.instructions,
      examples: formData.examples,
      category_id: formData.category_id || null,
      difficulty: formData.difficulty as "beginner" | "intermediate" | "advanced" | "expert",
      is_premium: formData.is_premium,
      is_agency_only: formData.is_agency_only,
      price: Number(formData.price),
      seo_title: formData.seo_title,
      seo_description: formData.seo_description,
      is_published: formData.is_published,
    };

    let error;
    let newPromptId: string | null = null;

    if (isEditing) {
      const result = await supabase
        .from("prompts")
        .update(promptData)
        .eq("id", id);
      error = result.error;
    } else {
      const result = await supabase
        .from("prompts")
        .insert([promptData])
        .select("id")
        .single();
      error = result.error;
      if (result.data) {
        newPromptId = result.data.id;
        setSavedPromptId(result.data.id);
      }
    }

    setIsSaving(false);

    if (error) {
      toast.error("Xatolik yuz berdi: " + error.message);
    } else {
      toast.success(isEditing ? "Promt yangilandi" : "Promt yaratildi");
      if (!isEditing && newPromptId) {
        // Navigate to edit page to allow adding media
        navigate(`/admin/prompts/${newPromptId}/edit`);
      } else {
        navigate("/admin/prompts");
      }
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
          onClick={() => navigate("/admin/prompts")}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Promtlarga qaytish
        </button>
        <h1 className="font-display text-2xl font-bold text-foreground">
          {isEditing ? "Promtni tahrirlash" : "Yangi promt qo'shish"}
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
                placeholder="Promt sarlavhasi"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="promt-slug"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Qisqa tavsif</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Promt haqida qisqa ma'lumot"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <Label htmlFor="difficulty">Murakkablik darajasi</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Boshlang'ich</SelectItem>
                  <SelectItem value="intermediate">O'rta</SelectItem>
                  <SelectItem value="advanced">Ilg'or</SelectItem>
                  <SelectItem value="expert">Ekspert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-card rounded-xl p-6 border border-border space-y-6">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Promt kontenti
          </h2>

          <div className="space-y-2">
            <Label htmlFor="content">Promt matni *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Asosiy promt matni..."
              rows={10}
              className="font-mono"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Qo'llanma</Label>
            <RichTextEditor
              value={formData.instructions}
              onChange={(val) => setFormData(prev => ({ ...prev, instructions: val }))}
              placeholder="Promtdan qanday foydalanish kerak..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions_video_url">Qo'llanma video URL (ixtiyoriy)</Label>
            <Input
              id="instructions_video_url"
              value={formData.instructions_video_url}
              onChange={(e) => setFormData(prev => ({ ...prev, instructions_video_url: e.target.value }))}
              placeholder="https://youtube.com/watch?v=... yoki https://vimeo.com/..."
            />
            <p className="text-xs text-muted-foreground">
              YouTube yoki Vimeo video havolasini kiriting
            </p>
          </div>

          <div className="space-y-2">
            <Label>Namunalar</Label>
            <RichTextEditor
              value={formData.examples}
              onChange={(val) => setFormData(prev => ({ ...prev, examples: val }))}
              placeholder="Ishlatish namunalari..."
            />
          </div>
        </div>

        {/* Media Manager - show when prompt is saved */}
        {savedPromptId && (
          <div className="bg-card rounded-xl p-6 border border-border space-y-6">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Media (Video va Rasmlar)
            </h2>
            <p className="text-sm text-muted-foreground">
              Qo'llanma videolari va natija rasmlarini qo'shing
            </p>
            <PromptMediaManager promptId={savedPromptId} />
          </div>
        )}

        {/* Pricing */}
        <div className="bg-card rounded-xl p-6 border border-border space-y-6">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Narx va mavjudlik
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Premium promt</Label>
                <p className="text-sm text-muted-foreground">
                  Faqat obuna bo'lgan foydalanuvchilar uchun
                </p>
              </div>
              <Switch
                checked={formData.is_premium}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_premium: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Agentlik uchun</Label>
                <p className="text-sm text-muted-foreground">
                  Faqat agentlik a'zolari uchun
                </p>
              </div>
              <Switch
                checked={formData.is_agency_only}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_agency_only: checked }))}
              />
            </div>
          </div>

          {formData.is_premium && (
            <div className="space-y-2">
              <Label htmlFor="price">Narx (so'm)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                placeholder="0"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div>
              <Label>Nashr holati</Label>
              <p className="text-sm text-muted-foreground">
                Promtni omma uchun ko'rinadigan qilish
              </p>
            </div>
            <Switch
              checked={formData.is_published}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
            />
          </div>
        </div>

        {/* SEO */}
        <div className="bg-card rounded-xl p-6 border border-border space-y-6">
          <h2 className="font-display text-lg font-semibold text-foreground">
            SEO
          </h2>

          <div className="space-y-2">
            <Label htmlFor="seo_title">SEO sarlavha</Label>
            <Input
              id="seo_title"
              value={formData.seo_title}
              onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
              placeholder="SEO uchun sarlavha (60 belgigacha)"
              maxLength={60}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo_description">SEO tavsif</Label>
            <Textarea
              id="seo_description"
              value={formData.seo_description}
              onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
              placeholder="SEO uchun tavsif (160 belgigacha)"
              rows={2}
              maxLength={160}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/prompts")}
          >
            Bekor qilish
          </Button>
          <Button type="submit" variant="hero" disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminPromptForm;
