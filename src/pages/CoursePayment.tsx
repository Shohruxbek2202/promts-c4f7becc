import { useState, useEffect } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { CreditCard, Upload, Copy, ArrowRight, ArrowLeft, Check, Clock, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

interface CourseInfo {
  id: string;
  title: string;
  slug: string;
  price: number;
  discount_price: number | null;
  cover_image_url: string | null;
  lessons_count: number;
}

interface PaymentSettings {
  card_number: string;
  card_holder: string;
  instructions: string;
}

const CoursePayment = () => {
  const { slug } = useParams();
  const { user, isLoading: authLoading } = useAuth();
  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [alreadyPurchased, setAlreadyPurchased] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    card_number: "8600 0000 0000 0000",
    card_holder: "SHOHRUX DIGITAL",
    instructions: "To'lovni amalga oshirgandan so'ng chekni yuklang",
  });

  useEffect(() => {
    if (slug) fetchCourse();
    fetchPaymentSettings();
  }, [slug, user]);

  const fetchCourse = async () => {
    setIsLoading(true);
    const { data } = await supabase.from("courses").select("id, title, slug, price, discount_price, cover_image_url, lessons_count").eq("slug", slug).eq("is_published", true).maybeSingle();
    if (data) {
      setCourse(data);
      if (user) {
        const { data: uc } = await supabase.from("user_courses").select("id").eq("user_id", user.id).eq("course_id", data.id).maybeSingle();
        if (uc) setAlreadyPurchased(true);
      }
    }
    setIsLoading(false);
  };

  const fetchPaymentSettings = async () => {
    const { data } = await supabase.from("settings").select("value").eq("key", "payment_settings").maybeSingle();
    if (data?.value) {
      const s = data.value as unknown as PaymentSettings;
      setPaymentSettings({ card_number: s.card_number || paymentSettings.card_number, card_holder: s.card_holder || paymentSettings.card_holder, instructions: s.instructions || paymentSettings.instructions });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { toast.error("Fayl hajmi 5MB dan kichik bo'lishi kerak"); return; }
      if (!file.type.startsWith("image/")) { toast.error("Faqat rasm fayllari qabul qilinadi"); return; }
      setReceiptFile(file);
    }
  };

  const handleSubmitPayment = async () => {
    if (!user || !course || !receiptFile) { toast.error("Barcha maydonlarni to'ldiring"); return; }
    setUploading(true);
    try {
      const fileExt = receiptFile.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("receipts").upload(fileName, receiptFile);
      if (uploadError) throw uploadError;
      const { error: paymentError } = await supabase.from("payments").insert({
        user_id: user.id,
        course_id: course.id,
        amount: course.discount_price || course.price,
        status: "pending",
        receipt_url: fileName,
        payment_method: "manual",
      });
      if (paymentError) throw paymentError;

      toast.success("To'lov so'rovi yuborildi! Tez orada tasdiqlanadi.");
      setReceiptFile(null);
    } catch (error) {
      console.error(error);
      toast.error("To'lovni yuborishda xatolik");
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => { navigator.clipboard.writeText(text); toast.success(`${label} nusxalandi!`); };
  const formatPrice = (price: number) => new Intl.NumberFormat("uz-UZ").format(price) + " so'm";

  if (authLoading || isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!course) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Kurs topilmadi</p></div>;

  const finalPrice = course.discount_price || course.price;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/courses" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="w-4 h-4 mr-1" />Kurslarga qaytish</Link>

          {alreadyPurchased ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 text-center">
              <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Bu kurs allaqachon sotib olingan!</h2>
              <p className="text-muted-foreground mb-4">Siz bu kursga kirish huquqiga egasiz</p>
              <Link to={`/courses?course=${course.slug}`}><Button>Kursga o'tish</Button></Link>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {/* Course info */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
                <div className="flex items-center gap-4">
                  {course.cover_image_url && <img src={course.cover_image_url} alt={course.title} className="w-20 h-14 rounded-lg object-cover" />}
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-foreground">{course.title}</h2>
                    <p className="text-sm text-muted-foreground">{course.lessons_count} ta dars</p>
                  </div>
                  <div className="text-right">
                    {course.discount_price ? (
                      <><p className="text-xl font-bold text-primary">{formatPrice(course.discount_price)}</p><p className="text-sm text-muted-foreground line-through">{formatPrice(course.price)}</p></>
                    ) : (
                      <p className="text-xl font-bold text-primary">{formatPrice(course.price)}</p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Bank details */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" /> Bank kartaga o'tkazish
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div><p className="text-xs text-muted-foreground">Karta raqami</p><p className="font-mono font-semibold text-foreground">{paymentSettings.card_number}</p></div>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(paymentSettings.card_number.replace(/\s/g, ""), "Karta raqami")}><Copy className="h-4 w-4" /></Button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div><p className="text-xs text-muted-foreground">Karta egasi</p><p className="font-semibold text-foreground">{paymentSettings.card_holder}</p></div>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(paymentSettings.card_holder, "Karta egasi")}><Copy className="h-4 w-4" /></Button>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 text-center">
                    <p className="text-sm text-muted-foreground">O'tkazish summasi</p>
                    <p className="text-3xl font-bold text-primary">{formatPrice(finalPrice)}</p>
                  </div>
                  {paymentSettings.instructions && <p className="text-sm text-muted-foreground p-3 rounded-lg bg-primary/5 border border-primary/10">💡 {paymentSettings.instructions}</p>}
                </div>
              </motion.div>

              {/* Upload receipt */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><Upload className="w-5 h-5 text-primary" /> Chekni yuklash</h2>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                    <Input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="receipt-upload" />
                    <Label htmlFor="receipt-upload" className="cursor-pointer flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center"><Upload className="h-8 w-8 text-primary" /></div>
                      {receiptFile ? <div><p className="font-medium text-primary">{receiptFile.name}</p><p className="text-sm text-muted-foreground">Boshqa fayl tanlash</p></div> : <div><p className="font-medium text-foreground">Chekni yuklang</p><p className="text-sm text-muted-foreground">PNG, JPG - 5MB gacha</p></div>}
                    </Label>
                  </div>
                  <Button className="w-full h-12 rounded-xl" onClick={handleSubmitPayment} disabled={!receiptFile || uploading}>
                    {uploading ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Yuklanmoqda...</> : <>To'lov so'rovini yuborish<ArrowRight className="w-4 h-4 ml-2" /></>}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">To'lovingiz 24 soat ichida tasdiqlanadi</p>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CoursePayment;
