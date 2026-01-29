import { motion } from "framer-motion";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { SEOHead, Breadcrumb } from "@/components/seo";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Foydalanish shartlari"
        description="PromptsHub foydalanish shartlari. Platformadan foydalanish qoidalari, huquqlar va majburiyatlar."
        keywords={["foydalanish shartlari", "terms of service", "qoidalar"]}
        canonicalUrl="https://mpbs.uz/terms"
      />
      <Header />
      
      <main className="container mx-auto px-4 py-12 pt-24">
        <Breadcrumb items={[{ label: "Foydalanish shartlari" }]} className="mb-6" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-primary/10 rounded-xl">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Foydalanish shartlari</h1>
              <p className="text-muted-foreground">Oxirgi yangilash: 2024-yil, Yanvar</p>
            </div>
          </div>

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">1. Umumiy qoidalar</h2>
              <p className="text-muted-foreground mb-4">
                Ushbu foydalanish shartlari PromptsHub platformasidan foydalanish qoidalarini belgilaydi. 
                Platformadan foydalanish orqali siz ushbu shartlarga rozilik bildirasiz.
              </p>
              <p className="text-muted-foreground">
                Agar siz ushbu shartlarga rozi bo'lmasangiz, iltimos platformadan foydalanmang.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">2. Xizmatlar</h2>
              <p className="text-muted-foreground mb-4">
                PromptsHub quyidagi xizmatlarni taqdim etadi:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>AI promtlar bazasiga kirish</li>
                <li>Marketing va biznes promtlari</li>
                <li>Video darsliklar va qo'llanmalar</li>
                <li>Premium kontentga kirish (obuna bo'yicha)</li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">3. Foydalanuvchi majburiyatlari</h2>
              <p className="text-muted-foreground mb-4">
                Foydalanuvchilar quyidagi qoidalarga rioya qilishlari shart:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>To'g'ri va aniq ma'lumotlar bilan ro'yxatdan o'tish</li>
                <li>Hisobingiz xavfsizligini ta'minlash</li>
                <li>Promtlarni noqonuniy maqsadlarda ishlatmaslik</li>
                <li>Boshqa foydalanuvchilar huquqlarini hurmat qilish</li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">4. Intellektual mulk</h2>
              <p className="text-muted-foreground">
                Platformadagi barcha kontentlar, shu jumladan promtlar, dizayn va logotiplar 
                PromptsHub mulki hisoblanadi. Ularni ruxsatsiz nusxalash, tarqatish yoki 
                sotish taqiqlanadi.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">5. To'lovlar va qaytarish</h2>
              <p className="text-muted-foreground mb-4">
                To'lovlar quyidagi qoidalar asosida amalga oshiriladi:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Barcha narxlar so'mda ko'rsatilgan</li>
                <li>To'lovlar xavfsiz usullar orqali amalga oshiriladi</li>
                <li>7 kun ichida pul qaytarish kafolati</li>
                <li>Obunalarni istalgan vaqtda bekor qilish mumkin</li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">6. Bog'lanish</h2>
              <p className="text-muted-foreground">
                Savollaringiz bo'lsa, biz bilan bog'laning:<br />
                Email: info@shohruxdigital.uz<br />
                Telefon: +998 90 123 45 67
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
