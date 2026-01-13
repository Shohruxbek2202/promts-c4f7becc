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

// Default gradient colors for categories
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
      
      // Fetch prompt counts for each category
      const counts: Record<string, number> = {};
      for (const cat of categoriesData) {
        const { count } = await supabase
          .from("prompts")
          .select("id", { count: "exact", head: true })
          .eq("category_id", cat.id)
          .eq("is_published", true);
        counts[cat.id] = count || 0;
      }
      setPromptCounts(counts);
    }
    setIsLoading(false);
  };

  const isUrl = (str: string) => {
    return str.startsWith("http://") || str.startsWith("https://");
  };

  const isEmoji = (str: string) => {
    const emojiRegex = /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]$/u;
    return emojiRegex.test(str) || str.length <= 2;
  };

  const renderIcon = (icon: string | null, index: number) => {
    if (!icon) {
      return <FolderOpen className="w-5 h-5 text-primary" />;
    }

    if (isUrl(icon)) {
      return (
        <img 
          src={icon} 
          alt="" 
          className="w-8 h-8 object-contain rounded-lg"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      );
    }

    if (isEmoji(icon)) {
      return <span className="text-2xl">{icon}</span>;
    }

    // Default folder icon
    return <FolderOpen className="w-5 h-5 text-primary" />;
  };

  if (isLoading) {
    return (
      <section id="categories" className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="categories" className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4">
            Kategoriyalarni kashf qiling
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {categories.length}+ kategoriya va professional promtlar sizni kutmoqda
          </p>
        </motion.div>

        {/* Categories - Vertical Sidebar Style like Apple Notes */}
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden shadow-xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border/50 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-4 text-sm font-medium text-muted-foreground">Kategoriyalar</span>
              </div>
            </div>

            {/* Categories List */}
            <div className="divide-y divide-border/30">
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                >
                  <Link 
                    to={`/prompts?category=${category.slug}`}
                    className="group flex items-center gap-4 px-6 py-4 hover:bg-primary/5 transition-all duration-200"
                  >
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientColors[index % gradientColors.length]} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      {renderIcon(category.icon, index)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-sm text-muted-foreground truncate">
                          {category.description}
                        </p>
                      )}
                    </div>

                    {/* Count Badge */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                        {promptCounts[category.id] || 0} promt
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border/50 bg-muted/20">
              <Link 
                to="/prompts" 
                className="flex items-center justify-center gap-2 text-primary font-medium hover:gap-3 transition-all"
              >
                Barcha promtlarni ko'rish
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
