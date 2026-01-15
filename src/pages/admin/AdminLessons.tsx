import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus,
  Edit,
  Trash2,
  Play,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  duration_minutes: number | null;
  is_published: boolean;
  created_at: string;
  categories?: {
    name: string;
  };
}

const AdminLessons = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("lessons")
      .select(`
        id, title, slug, description, video_url, thumbnail_url, 
        duration_minutes, is_published, created_at,
        categories (name)
      `)
      .order("sort_order", { ascending: true });

    if (data) setLessons(data as unknown as Lesson[]);
    if (error) console.error(error);
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu darsni o'chirishga ishonchingiz komilmi?")) return;

    const { error } = await supabase.from("lessons").delete().eq("id", id);
    
    if (error) {
      toast.error("Xatolik yuz berdi");
    } else {
      toast.success("Dars o'chirildi");
      fetchLessons();
    }
  };

  const togglePublish = async (id: string, isPublished: boolean) => {
    const { error } = await supabase
      .from("lessons")
      .update({ is_published: !isPublished })
      .eq("id", id);
    
    if (error) {
      toast.error("Xatolik yuz berdi");
    } else {
      toast.success(isPublished ? "Dars yashirildi" : "Dars nashr qilindi");
      fetchLessons();
    }
  };

  const filteredLessons = lessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Darslar
          </h1>
          <p className="text-muted-foreground">
            Video darslarni boshqaring
          </p>
        </div>
        <Link to="/admin/lessons/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Yangi dars
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Dars qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            Yuklanmoqda...
          </div>
        ) : filteredLessons.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            Darslar topilmadi
          </div>
        ) : (
          filteredLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-card rounded-xl border border-border overflow-hidden group"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-muted">
                {lesson.thumbnail_url ? (
                  <img
                    src={lesson.thumbnail_url}
                    alt={lesson.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Link to={`/admin/lessons/${lesson.id}/edit`}>
                    <Button size="sm" variant="secondary">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => togglePublish(lesson.id, lesson.is_published)}
                  >
                    {lesson.is_published ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(lesson.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {lesson.duration_minutes && (
                  <Badge className="absolute bottom-2 right-2 bg-black/70">
                    {lesson.duration_minutes} daqiqa
                  </Badge>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-foreground line-clamp-2">
                    {lesson.title}
                  </h3>
                  <Badge variant={lesson.is_published ? "default" : "secondary"}>
                    {lesson.is_published ? "Nashr" : "Qoralama"}
                  </Badge>
                </div>
                {lesson.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {lesson.description}
                  </p>
                )}
                {lesson.categories && (
                  <Badge variant="outline" className="mt-3">
                    {lesson.categories.name}
                  </Badge>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminLessons;
