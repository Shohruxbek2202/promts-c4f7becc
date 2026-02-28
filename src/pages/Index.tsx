import { useState, useEffect } from "react";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Categories } from "@/components/landing/Categories";
import { CoursesShowcase } from "@/components/landing/CoursesShowcase";
import { LessonsShowcase } from "@/components/landing/LessonsShowcase";
import { Pricing } from "@/components/landing/Pricing";
import { Referral } from "@/components/landing/Referral";
import { Footer } from "@/components/landing/Footer";
import { supabase } from "@/integrations/supabase/client";
import { 
  SEOHead, 
  SchemaMarkup, 
  OrganizationSchema, 
  WebSiteSchema, 
  SoftwareApplicationSchema,
  FAQSchema,
  TrustSignals,
  BestFitBrief,
  ComparisonTable,
  type TrustSignal,
  type BestFitInfo,
  type ComparisonFeature,
  type ComparisonProduct,
} from "@/components/seo";

interface SectionSettings {
  show_pricing: boolean;
  show_referral: boolean;
}

interface PublicStats {
  users_count: number;
  prompts_count: number;
  categories_count: number;
  lessons_count: number;
  courses_count: number;
  average_rating: number;
}

const Index = () => {
  const [sectionSettings, setSectionSettings] = useState<SectionSettings>({
    show_pricing: true,
    show_referral: true,
  });
  const [hasActivePlans, setHasActivePlans] = useState(false);
  const [stats, setStats] = useState<PublicStats>({
    users_count: 0,
    prompts_count: 0,
    categories_count: 0,
    lessons_count: 0,
    courses_count: 0,
    average_rating: 0,
  });

  useEffect(() => {
    fetchSettings();
    checkActivePlans();
    fetchPublicStats();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "section_visibility")
      .maybeSingle();
    
    if (data?.value) {
      const settings = data.value as unknown as SectionSettings;
      setSectionSettings({
        show_pricing: settings.show_pricing ?? true,
        show_referral: settings.show_referral ?? true,
      });
    }
  };

  const checkActivePlans = async () => {
    const { count } = await supabase
      .from("pricing_plans")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);
    
    setHasActivePlans((count || 0) > 0);
  };

  const fetchPublicStats = async () => {
    const { data } = await supabase.rpc("get_public_stats");
    if (data) {
      setStats(data as unknown as PublicStats);
    }
  };

  const showPricing = sectionSettings.show_pricing && hasActivePlans;
  const showReferral = sectionSettings.show_referral;

  const organizationSchema: OrganizationSchema = {
    type: "Organization",
    name: "MPBS.uz",
    url: "https://mpbs.uz",
    logo: "https://mpbs.uz/favicon.ico",
    description: "Marketing promtlari, onlayn kurslar va video darslar platformasi. Google Ads, Meta Ads, Yandex Direct va boshqa platformalar uchun tayyor promtlar.",
    sameAs: ["https://t.me/promptshub", "https://instagram.com/shohruxdigital"],
    contactPoint: { telephone: "+998901234567", contactType: "customer service", email: "info@shohruxdigital.uz" }
  };

  const websiteSchema: WebSiteSchema = {
    type: "WebSite",
    name: "MPBS.uz",
    url: "https://mpbs.uz",
    potentialAction: { target: "https://mpbs.uz/prompts?search={search_term_string}", queryInput: "required name=search_term_string" }
  };

  const softwareSchema: SoftwareApplicationSchema = {
    type: "SoftwareApplication",
    name: "MPBS.uz - Marketing AI Promtlari va Kurslar",
    description: "Digital marketing mutaxassislari uchun O'zbek tilida tayyor AI promtlar, professional onlayn kurslar va video darslar platformasi.",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { price: "0", priceCurrency: "UZS" },
    author: { name: "ShohruxDigital", url: "https://shohruxdigital.uz" },
    featureList: [
      "Marketing AI promtlari bazasi",
      "Professional onlayn kurslar",
      "Bepul video darsliklar",
      "Hamjamiyat chat xonalari",
      "Google Ads, Meta Ads promtlari",
      "O'zbek tilida tushuntirishlar",
      "3.5+ yillik marketing tajribasi"
    ],
    softwareVersion: "2.0",
    dateModified: new Date().toISOString().split("T")[0],
  };

  const faqSchema: FAQSchema = {
    type: "FAQPage",
    questions: [
      { question: "MPBS.uz nima?", answer: "MPBS.uz - marketing promtlari, professional onlayn kurslar va bepul video darslar platformasi. AI yordamida marketing samaradorligini oshirishga mo'ljallangan." },
      { question: "MPBS.uz da qanday kurslar bor?", answer: "AI va digital marketing bo'yicha professional onlayn kurslar mavjud. Har bir kursda video darslar, materiallar va hamjamiyat chati bor." },
      { question: "Bepul darslar bormi?", answer: "Ha, platformada bepul video darsliklar mavjud. Bundan tashqari, ba'zi kurslar ham bepul taklif etiladi." },
      { question: "Promtlardan qanday foydalanaman?", answer: "Promtni nusxalab, AI vositasiga (ChatGPT, Claude, Gemini) joylashtiring. O'zingizning ma'lumotlaringizni qo'shing va natija oling." },
      { question: "MPBS.uz bepulmi?", answer: "Asosiy promtlar va ba'zi darslar bepul. Premium promtlar, to'liq kurslar va hamjamiyat chati uchun obuna talab qilinadi." }
    ]
  };

  const trustSignals: TrustSignal[] = [
    { icon: "users", value: stats.users_count > 0 ? `${stats.users_count}+` : "—", label: "Foydalanuvchilar" },
    { icon: "star", value: stats.prompts_count > 0 ? `${stats.prompts_count}+` : "—", label: "Tayyor promtlar" },
    { icon: "check", value: stats.courses_count > 0 ? `${stats.courses_count}+` : "—", label: "Onlayn kurslar" },
    { icon: "award", value: stats.lessons_count > 0 ? `${stats.lessons_count}+` : "—", label: "Video darslar" },
  ];

  const bestFitData: BestFitInfo = {
    title: "MPBS.uz kimlar uchun?",
    subtitle: "Marketing promtlari, kurslar va darslar — bir platformada",
    tag: "3.5+ yillik tajriba",
    targetAudience: [
      "Digital marketing agentliklari va jamoalari",
      "Freelancer marketologlar va SMM mutaxassislari",
      "Startup asoschilari va biznes egalari",
      "AI yordamida ish samaradorligini oshirmoqchi bo'lganlar",
      "Marketing sohasini o'rganayotgan yangi boshlovchilar",
    ],
    idealFor: [
      "AI dan professional marketing natijalari olishni xohlasangiz",
      "Kurslar orqali digital marketingni chuqur o'rganmoqchi bo'lsangiz",
      "Tayyor promtlar bilan vaqt tejashni istasangiz",
      "Hamjamiyatda tajriba almashish va o'sishni xohlasangiz",
    ],
    notIdealFor: [
      "Kodlash/dasturlash promtlari izlovchilar",
      "Marketing bilan bog'liq bo'lmagan sohalar",
    ],
    keyBenefits: [
      "O'zbek tilida tushuntirilgan",
      "Real loyihalarda sinovdan o'tgan",
      "Video kurslar va darslar",
      "Hamjamiyat va chat xonalari",
      "Doimiy yangilanishlar",
    ],
    ctaText: "Platformani ko'rish",
    ctaLink: "/prompts",
  };

  const comparisonProducts: ComparisonProduct[] = [
    { name: "MPBS.uz", isHighlighted: true, price: "Bepul / Premium" },
    { name: "PromptBase", price: "$4.99/promt" },
    { name: "Udemy", price: "$10-50/kurs" },
    { name: "O'zingiz yozish", price: "Bepul" },
  ];

  const comparisonFeatures: ComparisonFeature[] = [
    { name: "O'zbek tilida", description: "Mahalliy bozor uchun optimallashtirilgan", values: { "MPBS.uz": true, "PromptBase": false, "Udemy": false, "O'zingiz yozish": true } },
    { name: "Marketing promtlar", description: "Tayyor AI marketing promtlari", values: { "MPBS.uz": true, "PromptBase": "partial", "Udemy": false, "O'zingiz yozish": false } },
    { name: "Onlayn kurslar", description: "Professional video kurslar", values: { "MPBS.uz": true, "PromptBase": false, "Udemy": true, "O'zingiz yozish": false } },
    { name: "Bepul darslar", description: "Bepul video darsliklar", values: { "MPBS.uz": true, "PromptBase": false, "Udemy": "partial", "O'zingiz yozish": false } },
    { name: "Hamjamiyat chati", description: "Real-time muhokama xonalari", values: { "MPBS.uz": true, "PromptBase": false, "Udemy": false, "O'zingiz yozish": false } },
    { name: "Mahalliy to'lov", description: "O'zbekiston kartalaridan to'lash", values: { "MPBS.uz": true, "PromptBase": false, "Udemy": false, "O'zingiz yozish": true } },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="MPBS.uz - Marketing Promtlar, Kurslar va Darslar | AI Platformasi"
        description="Digital marketing uchun tayyor AI promtlar, professional onlayn kurslar va bepul video darslar. O'zbek tilida. 3.5+ yillik tajriba."
        keywords={["AI promtlar", "marketing promtlari", "onlayn kurslar", "video darslar", "digital marketing", "ChatGPT promtlar", "Google Ads", "Meta Ads", "marketing kurslari", "MPBS.uz"]}
        canonicalUrl="https://mpbs.uz"
        ogType="website"
      />
      <SchemaMarkup schemas={[organizationSchema, websiteSchema, softwareSchema, faqSchema]} />
      
      <Header />
      
      <main>
        <Hero />
        
        <TrustSignals signals={trustSignals} title="Ishonch ko'rsatkichlari" />
        
        <Features />
        
        <CoursesShowcase />
        
        <Categories />
        
        <LessonsShowcase />
        
        <BestFitBrief data={bestFitData} />
        
        <ComparisonTable
          title="Nima uchun MPBS.uz?"
          description="Boshqa platformalar bilan taqqoslash"
          products={comparisonProducts}
          features={comparisonFeatures}
        />
        
        {showPricing && <Pricing />}
        {showReferral && <Referral />}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
