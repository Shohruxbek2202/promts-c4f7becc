import { motion } from "framer-motion";
import { 
  FolderTree, 
  FileText, 
  Layers,
  Shield, 
  Clock, 
  TrendingUp,
  GraduationCap,
  Users,
} from "lucide-react";

const features = [
  {
    icon: FolderTree,
    title: "Kategoriyalangan promt baza",
    description: "Google Ads, Meta Ads, Yandex Direct va boshqa platformalar uchun tartibli kategoriyalarda tayyor AI promtlar.",
  },
  {
    icon: GraduationCap,
    title: "Onlayn kurslar",
    description: "AI va digital marketing bo'yicha bosqichma-bosqich o'rgatuvchi onlayn video kurslar.",
  },
  {
    icon: Layers,
    title: "Video darsliklar",
    description: "Har bir mavzu bo'yicha alohida bepul video darslar — AI dan samarali foydalanishni o'rganing.",
  },
  {
    icon: Users,
    title: "Hamjamiyat chatlari",
    description: "Kurs a'zolari bilan real-time muhokama, tajriba almashish va savollarga javob olish.",
  },
  {
    icon: Clock,
    title: "Vaqtni tejash",
    description: "Tayyor promtlar va kurslar bilan o'nlab soatlik ishni bir necha daqiqada bajaring.",
  },
  {
    icon: TrendingUp,
    title: "Natijani 2-3x oshirish",
    description: "Sinovdan o'tgan promtlar va strategiyalar orqali marketing samaradorligini oshiring.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const Features = () => {
  return (
    <section id="features" className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Platformaning <span className="text-primary">asosiy afzalliklari</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Promtlar, kurslar, darslar va hamjamiyat — barchasi bir joyda.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
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
