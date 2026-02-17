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
  BookOpen,
  Eye,
  EyeOff,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  price: number;
  discount_price: number | null;
  lessons_count: number;
  is_published: boolean;
  created_at: string;
  categories?: { name: string } | null;
}

const AdminCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("courses")
      .select(`id, title, slug, description, cover_image_url, price, discount_price, lessons_count, is_published, created_at, categories (name)`)
      .order("sort_order", { ascending: true });

    if (data) setCourses(data as unknown as Course[]);
    if (error) console.error(error);
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kursni o'chirishga ishonchingiz komilmi?")) return;
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) {
      toast.error("Xatolik yuz berdi");
    } else {
      toast.success("Kurs o'chirildi");
      fetchCourses();
    }
  };

  const togglePublish = async (id: string, isPublished: boolean) => {
    const { error } = await supabase
      .from("courses")
      .update({ is_published: !isPublished })
      .eq("id", id);
    if (error) {
      toast.error("Xatolik yuz berdi");
    } else {
      toast.success(isPublished ? "Kurs yashirildi" : "Kurs nashr qilindi");
      fetchCourses();
    }
  };

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("uz-UZ").format(price) + " so'm";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Kurslar</h1>
          <p className="text-muted-foreground">Online kurslarni boshqaring</p>
        </div>
        <Link to="/admin/courses/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Yangi kurs
          </Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Kurs qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">Yuklanmoqda...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">Kurslar topilmadi</div>
        ) : (
          filteredCourses.map((course) => (
            <div key={course.id} className="bg-card rounded-xl border border-border overflow-hidden group">
              <div className="relative aspect-video bg-muted">
                {course.cover_image_url ? (
                  <img src={course.cover_image_url} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Link to={`/admin/courses/${course.id}/edit`}>
                    <Button size="sm" variant="secondary"><Edit className="w-4 h-4" /></Button>
                  </Link>
                  <Link to={`/admin/courses/${course.id}/lessons`}>
                    <Button size="sm" variant="secondary"><BookOpen className="w-4 h-4" /></Button>
                  </Link>
                  <Button size="sm" variant="secondary" onClick={() => togglePublish(course.id, course.is_published)}>
                    {course.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(course.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-foreground line-clamp-2">{course.title}</h3>
                  <Badge variant={course.is_published ? "default" : "secondary"}>
                    {course.is_published ? "Nashr" : "Qoralama"}
                  </Badge>
                </div>
                {course.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{course.description}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    {course.discount_price ? (
                      <>
                        <span className="text-sm font-bold text-primary">{formatPrice(course.discount_price)}</span>
                        <span className="text-xs text-muted-foreground line-through">{formatPrice(course.price)}</span>
                      </>
                    ) : (
                      <span className="text-sm font-bold text-primary">{formatPrice(course.price)}</span>
                    )}
                  </div>
                  <Badge variant="outline">{course.lessons_count} dars</Badge>
                </div>
                {course.categories && (
                  <Badge variant="outline" className="mt-2">{course.categories.name}</Badge>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminCourses;
