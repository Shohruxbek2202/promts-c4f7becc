import { motion } from "framer-motion";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Shield } from "lucide-react";
import { SEOHead, Breadcrumb } from "@/components/seo";
import { useContactSettings } from "@/hooks/useContactSettings";

const Privacy = () => {
  const { settings } = useContactSettings();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Maxfiylik siyosati"
        description="PromptsHub maxfiylik siyosati. Sizning ma'lumotlaringiz qanday to'planadi, ishlatiladi va himoya qilinadi."
        keywords={["maxfiylik", "privacy policy", "ma'lumotlar himoyasi"]}
        canonicalUrl="https://mpbs.uz/privacy"
      />
      <Header />
      
      <main className="container mx-auto px-4 py-12 pt-24">
        <Breadcrumb items={[{ label: "Maxfiylik siyosati" }]} className="mb-6" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Maxfiylik siyosati</h1>
              <p className="text-muted-foreground">Oxirgi yangilash: 2024-yil, Yanvar</p>
            </div>
          </div>

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">1. Kirish</h2>
              <p className="text-muted-foreground">
                PromptsHub sizning maxfiyligingizni muhim deb biladi. Ushbu siyosat biz qanday 
                ma'lumotlarni to'plashimiz, qanday ishlatishimiz va himoya qilishimizni tushuntiradi.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">2. To'planadigan ma'lumotlar</h2>
              <p className="text-muted-foreground mb-4">
                Biz quyidagi ma'lumotlarni to'plashimiz mumkin:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Ro'yxatdan o'tish ma'lumotlari (ism, email, telefon)</li>
                <li>Foydalanish statistikasi</li>
                <li>To'lov ma'lumotlari (xavfsiz tarzda saqlanadi)</li>
                <li>Qurilma va brauzer ma'lumotlari</li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">3. Ma'lumotlardan foydalanish</h2>
              <p className="text-muted-foreground mb-4">
                Sizning ma'lumotlaringiz quyidagi maqsadlarda ishlatiladi:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Xizmatlarni taqdim etish va yaxshilash</li>
                <li>Sizga mos kontentni tavsiya qilish</li>
                <li>Xavfsizlikni ta'minlash</li>
                <li>Qonuniy talablarga javob berish</li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">4. Ma'lumotlarni himoya qilish</h2>
              <p className="text-muted-foreground">
                Biz sizning ma'lumotlaringizni himoya qilish uchun zamonaviy xavfsizlik 
                texnologiyalaridan foydalanamiz. Barcha ma'lumotlar shifrlangan holda saqlanadi.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">5. Cookie fayllar</h2>
              <p className="text-muted-foreground">
                Saytimiz cookie fayllardan foydalanadi. Ular saytdan qulay foydalanish va 
                analitika uchun ishlatiladi. Siz brauzer sozlamalarida cookie'larni 
                o'chirib qo'yishingiz mumkin.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">6. Sizning huquqlaringiz</h2>
              <p className="text-muted-foreground mb-4">
                Siz quyidagi huquqlarga egasiz:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Ma'lumotlaringizni ko'rish va yangilash</li>
                <li>Ma'lumotlaringizni o'chirishni so'rash</li>
                <li>Marketing xabarlaridan voz kechish</li>
                <li>Ma'lumotlaringiz haqida so'rov yuborish</li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">7. Bog'lanish</h2>
              <p className="text-muted-foreground">
                Maxfiylik bilan bog'liq savollaringiz bo'lsa:<br />
                Email: {settings.email}<br />
                Telefon: {settings.phone}
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
