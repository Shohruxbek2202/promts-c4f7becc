import { motion } from "framer-motion";
import { 
  Search, 
  FolderTree, 
  FileText, 
  Shield, 
  Clock, 
  TrendingUp,
  Layers,
  Zap
} from "lucide-react";

const features = [
  {
    icon: FolderTree,
    title: "4 darajali kategoriya",
    description: "Chuqur tuzilgan kategoriya tizimi orqali kerakli promtni tez toping.",
  },
  {
    icon: FileText,
    title: "To'liq dokumentatsiya",
    description: "Har bir promt bilan qadam-baqadam instruksiya va ishlatish misollari.",
  },
  {
    icon: Layers,
    title: "Versiya nazorati",
    description: "Promtlarning barcha versiyalarini ko'ring va taqqoslang.",
  },
  {
    icon: Shield,
    title: "Professional sifat",
    description: "Barcha promtlar ekspertlar tomonidan tekshirilgan va tasdiqlangan.",
  },
  {
    icon: Clock,
    title: "Vaqtni tejash",
    description: "O'nlab soatlik ishni bir necha daqiqada bajarib qo'ying.",
  },
  {
    icon: TrendingUp,
    title: "Natijani oshirish",
    description: "Samarali promtlar orqali marketing natijalaringizni 2-3x oshiring.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-background">
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
            Nima uchun bizni <span className="text-primary">tanlash</span> kerak?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional marketing promtlari bilan vaqtingizni tejang va natijalaringizni maksimal darajada oshiring.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group glass-card p-6 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
