import { motion } from "framer-motion";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { CreditCard, ArrowLeft, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const PaymentTerms = () => {
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
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-primary/10 rounded-xl">
              <CreditCard className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">To'lov shartlari</h1>
              <p className="text-muted-foreground">Oxirgi yangilash: 2024-yil, Yanvar</p>
            </div>
          </div>

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">To'lov usullari</h2>
              <p className="text-muted-foreground mb-4">
                Biz quyidagi to'lov usullarini qabul qilamiz:
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-foreground">Click</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-foreground">Payme</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-foreground">Bank kartasi (Visa/MasterCard)</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-foreground">Bank o'tkazmasi</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Narxlar</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Barcha narxlar O'zbekiston so'mida ko'rsatilgan</li>
                <li>Narxlarga QQS kiritilgan</li>
                <li>Narxlar oldindan ogohlantirmasdan o'zgartirilishi mumkin</li>
                <li>Chegirmalar va aksiyalar vaqtinchalik bo'lishi mumkin</li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Obuna shartlari</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Oylik obuna har oyning boshida avtomatik yangilanadi</li>
                <li>Yillik obuna yil oxirida avtomatik yangilanadi</li>
                <li>Lifetime obuna bir martalik to'lov bilan cheksiz foydalanish imkonini beradi</li>
                <li>Obunani istalgan vaqtda bekor qilish mumkin</li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Pul qaytarish siyosati</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Biz 7 kunlik pul qaytarish kafolatini taqdim etamiz. Agar xizmatdan 
                  qoniqmasangiz, to'lovdan 7 kun ichida to'liq pulni qaytarib olishingiz mumkin.
                </p>
                <p>Pul qaytarish uchun:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>info@shohruxdigital.uz ga xat yozing</li>
                  <li>To'lov raqami va sababini ko'rsating</li>
                  <li>3-5 ish kuni ichida pul qaytariladi</li>
                </ul>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Xavfsizlik</h2>
              <p className="text-muted-foreground">
                Barcha to'lovlar xavfsiz shifrlangan ulanish orqali amalga oshiriladi. 
                Biz sizning karta ma'lumotlaringizni saqlamaymiz - barcha to'lovlar 
                ishonchli to'lov provayderlari orqali o'tkaziladi.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Bog'lanish</h2>
              <p className="text-muted-foreground">
                To'lov bilan bog'liq savollaringiz bo'lsa:<br />
                Email: billing@shohruxdigital.uz<br />
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

export default PaymentTerms;
