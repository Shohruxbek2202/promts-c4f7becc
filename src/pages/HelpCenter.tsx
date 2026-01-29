import { motion } from "framer-motion";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Headphones, 
  MessageCircle, 
  Mail, 
  Phone, 
  BookOpen, 
  Video,
  ArrowLeft,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";

const helpCategories = [
  {
    icon: BookOpen,
    title: "Foydalanish bo'yicha qo'llanma",
    description: "Platformadan qanday foydalanishni o'rganing",
    link: "/lessons"
  },
  {
    icon: Video,
    title: "Video darsliklar",
    description: "Bosqichma-bosqich video ko'rsatmalar",
    link: "/lessons"
  },
  {
    icon: MessageCircle,
    title: "FAQ",
    description: "Ko'p so'raladigan savollar va javoblar",
    link: "/faq"
  }
];

const contactMethods = [
  {
    icon: MessageCircle,
    title: "Telegram",
    description: "Eng tez javob olish uchun",
    action: "Telegram bot",
    link: "#"
  },
  {
    icon: Mail,
    title: "Email",
    description: "info@shohruxdigital.uz",
    action: "Email yozish",
    link: "mailto:info@shohruxdigital.uz"
  },
  {
    icon: Phone,
    title: "Telefon",
    description: "+998 90 123 45 67",
    action: "Qo'ng'iroq qilish",
    link: "tel:+998901234567"
  }
];

const HelpCenter = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12 pt-24">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Bosh sahifa
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Headphones className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Yordam markazi</h1>
              <p className="text-muted-foreground">Sizga qanday yordam bera olamiz?</p>
            </div>
          </div>

          {/* Help Categories */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-4">O'zingiz o'rganing</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {helpCategories.map((category, index) => (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link to={category.link}>
                    <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
                      <CardHeader>
                        <div className="p-2 bg-primary/10 rounded-lg w-fit mb-2">
                          <category.icon className="w-5 h-5 text-primary" />
                        </div>
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Contact Methods */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-4">Biz bilan bog'laning</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {contactMethods.map((method, index) => (
                <motion.div
                  key={method.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <div className="p-2 bg-primary/10 rounded-lg w-fit mb-2">
                        <method.icon className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{method.title}</CardTitle>
                      <CardDescription>{method.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <a href={method.link} target={method.link.startsWith("http") ? "_blank" : undefined}>
                        <Button variant="outline" size="sm" className="w-full">
                          {method.action}
                          <ExternalLink className="w-3 h-3 ml-2" />
                        </Button>
                      </a>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Working Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="p-6 bg-card border border-border rounded-xl text-center"
          >
            <h3 className="text-lg font-semibold text-foreground mb-2">Ish vaqtlari</h3>
            <p className="text-muted-foreground">
              Dushanba - Juma: 09:00 - 18:00<br />
              Shanba: 10:00 - 15:00<br />
              Yakshanba: Dam olish kuni
            </p>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default HelpCenter;
