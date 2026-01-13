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
    gradient: "from-blue-500/20 to-blue-600/10",
    iconColor: "text-blue-500",
  },
  {
    icon: Megaphone,
    name: "Meta Ads",
    count: "18,000+",
    gradient: "from-indigo-500/20 to-indigo-600/10",
    iconColor: "text-indigo-500",
  },
  {
    icon: BarChart3,
    name: "Yandex Direct",
    count: "12,000+",
    gradient: "from-red-500/20 to-red-600/10",
    iconColor: "text-red-500",
  },
  {
    icon: PenTool,
    name: "Content Marketing",
    count: "20,000+",
    gradient: "from-emerald-500/20 to-emerald-600/10",
    iconColor: "text-emerald-500",
  },
  {
    icon: Mail,
    name: "Email Marketing",
    count: "10,000+",
    gradient: "from-amber-500/20 to-amber-600/10",
    iconColor: "text-amber-500",
  },
  {
    icon: Users,
    name: "SMM Strategy",
    count: "8,000+",
    gradient: "from-pink-500/20 to-pink-600/10",
    iconColor: "text-pink-500",
  },
  {
    icon: Globe,
    name: "SEO Prompts",
    count: "9,000+",
    gradient: "from-cyan-500/20 to-cyan-600/10",
    iconColor: "text-cyan-500",
  },
  {
    icon: Search,
    name: "Analytics",
    count: "8,000+",
    gradient: "from-violet-500/20 to-violet-600/10",
    iconColor: "text-violet-500",
  },
];

export const Categories = () => {
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
            50+ kategoriya va 100,000+ professional promt sizni kutmoqda
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <Link to="/prompts" className="group block">
                <div className="glass-card p-6 h-full">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <category.icon className={`w-6 h-6 ${category.iconColor}`} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
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
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link 
            to="/prompts" 
            className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
          >
            Barcha kategoriyalarni ko'rish
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
