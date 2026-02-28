import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { GraduationCap, Clock, BookOpen, ArrowRight, User } from "lucide-react";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  price: number;
  discount_price: number | null;
  duration_minutes: number | null;
  lessons_count: number | null;
  instructor_name: string | null;
}

export const CoursesShowcase = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCounts, setEnrolledCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchCourses = async () => {
      const { data } = await supabase
        .from("courses")
        .select("id, title, slug, description, cover_image_url, price, discount_price, duration_minutes, lessons_count, instructor_name")
        .eq("is_published", true)
        .order("sort_order")
        .limit(6);
      
      if (data && data.length > 0) {
        setCourses(data);
        const ids = data.map(c => c.id);
        const { data: countData } = await supabase.rpc("get_course_enrolled_counts", { course_ids: ids });
        if (countData) {
          const counts: Record<string, number> = {};
          for (const row of countData as { course_id: string; enrolled_count: number }[]) {
            counts[row.course_id] = row.enrolled_count;
          }
          setEnrolledCounts(counts);
        }
      }
    };
    fetchCourses();
  }, []);

  if (courses.length === 0) return null;

  const formatPrice = (price: number) => {
    if (price === 0) return "Bepul";
    return new Intl.NumberFormat("uz-UZ").format(price) + " so'm";
  };

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            <span className="text-primary">Kurslar</span> va ta'lim
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AI va digital marketing bo'yicha professional onlayn kurslar bilan bilimingizni oshiring.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={`/courses?course=${course.slug}`} className="block group">
                <div className="glass-card overflow-hidden hover:-translate-y-1 transition-all duration-300">
                  {/* Cover */}
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {course.cover_image_url ? (
                      <img src={course.cover_image_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                        <GraduationCap className="w-12 h-12 text-primary/40" />
                      </div>
                    )}
                    {course.price === 0 && (
                      <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">Bepul</Badge>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-semibold text-foreground text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{course.description}</p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        {course.discount_price != null ? formatPrice(course.discount_price) : formatPrice(course.price)}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {(course.lessons_count || 0) > 0 && (
                          <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{course.lessons_count}</span>
                        )}
                        {(course.duration_minutes || 0) > 0 && (
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{course.duration_minutes} daq</span>
                        )}
                        {(enrolledCounts[course.id] || 0) > 0 && (
                          <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{enrolledCounts[course.id]}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <Link to="/courses">
            <Button variant="outline" size="lg" className="rounded-full gap-2">
              Barcha kurslarni ko'rish <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
