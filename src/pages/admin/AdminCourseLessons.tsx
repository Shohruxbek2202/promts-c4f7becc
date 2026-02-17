import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft, Plus, Edit, Trash2, Eye, EyeOff, GripVertical, Play,
} from "lucide-react";
import { toast } from "sonner";

interface CourseLesson {
  id: string;
  title: string;
  slug: string;
  duration_minutes: number | null;
  sort_order: number;
  is_preview: boolean;
  is_published: boolean;
  video_url: string | null;
  video_file_url: string | null;
  thumbnail_url: string | null;
}

interface Course {
  id: string;
  title: string;
}

const AdminCourseLessons = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<CourseLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
      fetchLessons();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    const { data } = await supabase.from("courses").select("id, title").eq("id", courseId).single();
    if (data) setCourse(data);
  };

  const fetchLessons = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("course_lessons")
      .select("*")
      .eq("course_id", courseId)
      .order("sort_order", { ascending: true });
    if (data) setLessons(data as CourseLesson[]);
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu darsni o'chirishga ishonchingiz komilmi?")) return;
    const { error } = await supabase.from("course_lessons").delete().eq("id", id);
    if (error) toast.error("Xatolik yuz berdi");
    else { toast.success("Dars o'chirildi"); fetchLessons(); updateLessonCount(); }
  };

  const togglePublish = async (id: string, isPublished: boolean) => {
    const { error } = await supabase.from("course_lessons").update({ is_published: !isPublished }).eq("id", id);
    if (error) toast.error("Xatolik");
    else { toast.success(isPublished ? "Dars yashirildi" : "Dars nashr qilindi"); fetchLessons(); }
  };

  const updateLessonCount = async () => {
    const { count } = await supabase.from("course_lessons").select("*", { count: "exact", head: true }).eq("course_id", courseId);
    await supabase.from("courses").update({ lessons_count: count || 0 }).eq("id", courseId);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate("/admin/courses")} className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" /> Kurslarga qaytish
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">{course?.title || "Kurs"} — Darslar</h1>
            <p className="text-muted-foreground mt-1">{lessons.length} ta dars</p>
          </div>
          <Link to={`/admin/courses/${courseId}/lessons/new`}>
            <Button><Plus className="w-4 h-4 mr-2" /> Yangi dars</Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Yuklanmoqda...</div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <Play className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Hali darslar qo'shilmagan</p>
          <Link to={`/admin/courses/${courseId}/lessons/new`}>
            <Button><Plus className="w-4 h-4 mr-2" /> Birinchi darsni qo'shish</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson, index) => (
            <div key={lesson.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
              <div className="text-muted-foreground cursor-grab"><GripVertical className="w-5 h-5" /></div>
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">{index + 1}</div>
              {lesson.thumbnail_url ? (
                <img src={lesson.thumbnail_url} alt="" className="w-16 h-10 rounded object-cover" />
              ) : (
                <div className="w-16 h-10 rounded bg-muted flex items-center justify-center"><Play className="w-4 h-4 text-muted-foreground/50" /></div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">{lesson.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {lesson.duration_minutes && <span className="text-xs text-muted-foreground">{lesson.duration_minutes} daqiqa</span>}
                  {lesson.is_preview && <Badge variant="outline" className="text-xs">Bepul ko'rish</Badge>}
                </div>
              </div>
              <Badge variant={lesson.is_published ? "default" : "secondary"}>{lesson.is_published ? "Nashr" : "Qoralama"}</Badge>
              <div className="flex items-center gap-1">
                <Link to={`/admin/courses/${courseId}/lessons/${lesson.id}/edit`}>
                  <Button size="sm" variant="ghost"><Edit className="w-4 h-4" /></Button>
                </Link>
                <Button size="sm" variant="ghost" onClick={() => togglePublish(lesson.id, lesson.is_published)}>
                  {lesson.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(lesson.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCourseLessons;
