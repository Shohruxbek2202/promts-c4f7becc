import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Target,
  BarChart3,
  Mail,
  Megaphone,
  PenTool,
  Users,
  Globe,
  Search,
  ArrowRight
} from "lucide-react";

const categories = [
  {
    icon: Target,
    name: "Google Ads",
    count: "15,000+",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: Megaphone,
    name: "Meta Ads",
    count: "18,000+",
    color: "bg-indigo-500/10 text-indigo-600",
  },
  {
    icon: BarChart3,
    name: "Yandex Direct",
    count: "12,000+",
    color: "bg-red-500/10 text-red-600",
  },
  {
    icon: PenTool,
    name: "Content Marketing",
    count: "20,000+",
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    icon: Mail,
    name: "Email Marketing",
    count: "10,000+",
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    icon: Users,
    name: "SMM Strategy",
    count: "8,000+",
    color: "bg-pink-500/10 text-pink-600",
  },
  {
    icon: Globe,
    name: "SEO Prompts",
    count: "9,000+",
    color: "bg-cyan-500/10 text-cyan-600",
  },
  {
    icon: Search,
    name: "Analytics",
    count: "8,000+",
    color: "bg-violet-500/10 text-violet-600",
  },
];

export const Categories = () => {
  return (
    <section id="categories" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Kategoriyalarni kashf qiling
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            50+ kategoriya va 100,000+ professional promt sizni kutmoqda
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="group cursor-pointer"
            >
              <Link to="/prompts">
                <div className="bg-card rounded-2xl p-6 border border-border shadow-card hover:shadow-card-hover transition-all duration-300 h-full">
                  <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center mb-4`}>
                    <category.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {category.count} promtlar
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Link 
            to="/prompts" 
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
          >
            Barcha kategoriyalarni ko'rish
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
