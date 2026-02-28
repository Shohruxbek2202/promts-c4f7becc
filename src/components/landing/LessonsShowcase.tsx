import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Play, Clock, ArrowRight } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  duration_minutes: number | null;
  categories?: { name: string } | null;
}

export const LessonsShowcase = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    const fetchLessons = async () => {
      const { data } = await supabase
        .from("lessons")
        .select("id, title, slug, description, thumbnail_url, duration_minutes, categories(name)")
        .eq("is_published", true)
        .order("sort_order")
        .limit(4);
      if (data) setLessons(data as unknown as Lesson[]);
    };
    fetchLessons();
  }, []);

  if (lessons.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Bepul <span className="text-primary">video darslar</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AI va marketing bo'yicha bepul darslarni ko'ring va o'rganing.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {lessons.map((lesson, i) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={`/lessons/${lesson.slug}`} className="block group">
                <div className="glass-card overflow-hidden hover:-translate-y-1 transition-all duration-300">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {lesson.thumbnail_url ? (
                      <img src={lesson.thumbnail_url} alt={lesson.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                        <Play className="w-10 h-10 text-primary/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-foreground text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {lesson.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {lesson.categories?.name && <span>{lesson.categories.name}</span>}
                      {(lesson.duration_minutes || 0) > 0 && (
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{lesson.duration_minutes} daq</span>
                      )}
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
          <Link to="/lessons">
            <Button variant="outline" size="lg" className="rounded-full gap-2">
              Barcha darslarni ko'rish <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
