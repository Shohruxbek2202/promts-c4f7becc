import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, FolderOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
}

const gradientColors = [
  "from-blue-500/20 to-blue-600/10",
  "from-indigo-500/20 to-indigo-600/10",
  "from-red-500/20 to-red-600/10",
  "from-emerald-500/20 to-emerald-600/10",
  "from-amber-500/20 to-amber-600/10",
  "from-pink-500/20 to-pink-600/10",
  "from-cyan-500/20 to-cyan-600/10",
  "from-violet-500/20 to-violet-600/10",
  "from-orange-500/20 to-orange-600/10",
  "from-teal-500/20 to-teal-600/10",
];

export const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [promptCounts, setPromptCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data: categoriesData } = await supabase
      .from("categories")
      .select("id, name, slug, icon, description")
      .eq("is_active", true)
      .order("sort_order");

    if (categoriesData) {
      setCategories(categoriesData);
      
      // Fetch all published prompts with category_id in one query
      const { data: prompts } = await supabase
        .from("prompts")
        .select("category_id")
        .eq("is_published", true)
        .in("category_id", categoriesData.map(c => c.id));
      
      const counts: Record<string, number> = {};
      if (prompts) {
        for (const p of prompts) {
          if (p.category_id) {
            counts[p.category_id] = (counts[p.category_id] || 0) + 1;
          }
        }
      }
      setPromptCounts(counts);
    }
    setIsLoading(false);
  };

  const isUrl = (str: string) => str.startsWith("http://") || str.startsWith("https://");

  const isEmoji = (str: string) => {
    const emojiRegex = /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]$/u;
    return emojiRegex.test(str) || str.length <= 2;
  };

  const renderIcon = (icon: string | null) => {
    if (!icon) return <FolderOpen className="w-5 h-5 text-primary" />;
    if (isUrl(icon)) {
      return (
        <img src={icon} alt="" className="w-8 h-8 object-contain rounded-lg"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      );
    }
    if (isEmoji(icon)) return <span className="text-2xl">{icon}</span>;
    return <FolderOpen className="w-5 h-5 text-primary" />;
  };

  if (isLoading) {
    return (
      <section id="categories" className="py-8 sm:py-12 md:py-16 relative">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="categories" className="py-8 sm:py-12 md:py-16 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-6 sm:mb-12"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Kategoriyalar
          </h2>
          <Link 
            to="/prompts" 
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            Barchasi
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {categories.slice(0, 6).map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link 
                to={`/prompts?category=${category.slug}`}
                className="group glass-card flex items-center gap-3 sm:gap-4 p-4 sm:p-5 hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${gradientColors[index % gradientColors.length]} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  {renderIcon(category.icon)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {promptCounts[category.id] || 0} promt
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
