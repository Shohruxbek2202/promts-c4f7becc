import { useState, useEffect } from "react";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Categories } from "@/components/landing/Categories";
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

  // Pricing only shows if setting is enabled AND there are active plans
  const showPricing = sectionSettings.show_pricing && hasActivePlans;
  const showReferral = sectionSettings.show_referral;

  // Schema.org - Organization
  const organizationSchema: OrganizationSchema = {
    type: "Organization",
    name: "PromptsHub",
    url: "https://mpbs.uz",
    logo: "https://mpbs.uz/favicon.ico",
    description: "Marketing promtlari bazasi. Google Ads, Meta Ads, Yandex Direct va boshqa platformalar uchun tayyor promtlar.",
    sameAs: [
      "https://t.me/promptshub",
      "https://instagram.com/shohruxdigital"
    ],
    contactPoint: {
      telephone: "+998901234567",
      contactType: "customer service",
      email: "info@shohruxdigital.uz"
    }
  };

  // Schema.org - WebSite with SearchAction
  const websiteSchema: WebSiteSchema = {
    type: "WebSite",
    name: "PromptsHub",
    url: "https://mpbs.uz",
    potentialAction: {
      target: "https://mpbs.uz/prompts?search={search_term_string}",
      queryInput: "required name=search_term_string"
    }
  };

  // Schema.org - SoftwareApplication (SaaS SEO 2026)
  const softwareSchema: SoftwareApplicationSchema = {
    type: "SoftwareApplication",
    name: "PromptsHub - Marketing AI Promtlari",
    description: "Digital marketing mutaxassislari uchun O'zbek tilida tayyor AI promtlar bazasi. ChatGPT, Google Ads, Meta Ads uchun optimallashtirilgan.",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      price: "0",
      priceCurrency: "UZS",
    },
    author: {
      name: "ShohruxDigital",
      url: "https://shohruxdigital.uz",
    },
    featureList: [
      "O'zbek tilida tayyor marketing promtlari",
      "Google Ads uchun promtlar",
      "Meta Ads uchun promtlar", 
      "Yandex Direct promtlari",
      "Har hafta yangi promtlar",
      "Video darsliklar",
      "3.5+ yillik marketing tajribasi"
    ],
    softwareVersion: "2.0",
    dateModified: new Date().toISOString().split("T")[0],
  };

  // Schema.org - FAQ (AI visibility uchun)
  const faqSchema: FAQSchema = {
    type: "FAQPage",
    questions: [
      {
        question: "PromptsHub nima?",
        answer: "PromptsHub - bu digital marketing mutaxassislari uchun O'zbek tilida tayyor AI promtlar bazasi. Har bir promt ChatGPT tushunishi uchun maxsus optimallashtirilgan."
      },
      {
        question: "Promtlar qaysi tilda yozilgan?",
        answer: "Promtlar O'zbek tilida tushuntirilgan va AI (ChatGPT, Claude) bilan ishlash uchun maxsus formatda tayyorlangan. Promt matnining o'zi ingliz yoki rus tilida bo'lishi mumkin, chunki AI shu tillarda yaxshiroq ishlaydi."
      },
      {
        question: "Promtlardan qanday foydalanaman?",
        answer: "Promtni nusxalab, ChatGPT yoki boshqa AI vositasiga joylashtiring. O'zingizning mahsulot/xizmat ma'lumotlaringizni qo'shing va natija oling."
      },
      {
        question: "PromptsHub bepulmi?",
        answer: "Ha, asosiy promtlar bepul. Premium promtlar va video darsliklar uchun obuna talab qilinadi."
      },
      {
        question: "Loyiha ortida kim bor?",
        answer: "PromptsHub 3.5+ yillik digital marketing tajribasiga ega ShohruxDigital jamoasi tomonidan yaratilgan. Barcha promtlar real loyihalarda sinovdan o'tkazilgan."
      }
    ]
  };

  // E-E-A-T Trust Signals - haqiqiy ma'lumotlar bazadan
  const trustSignals: TrustSignal[] = [
    { 
      icon: "users", 
      value: stats.users_count > 0 ? `${stats.users_count}+` : "—", 
      label: "Foydalanuvchilar" 
    },
    { 
      icon: "check", 
      value: stats.prompts_count > 0 ? `${stats.prompts_count}+` : "—", 
      label: "O'zbek tilida promtlar" 
    },
    { 
      icon: "star", 
      value: `${stats.categories_count}`, 
      label: "Kategoriyalar" 
    },
    { 
      icon: "award", 
      value: "3.5+", 
      label: "Yillik tajriba" 
    },
  ];

  // Best Fit Brief (AI/GEO optimization)
  const bestFitData: BestFitInfo = {
    title: "PromptsHub kimlar uchun?",
    subtitle: "O'zbek tilida tushuntirilgan AI promtlar bazasi",
    tag: "3.5+ yillik tajriba",
    targetAudience: [
      "Digital marketing agentliklari",
      "Freelancer marketologlar",
      "Startup asoschilari",
      "SMM mutaxassislari",
      "Content marketing bo'limlari",
    ],
    idealFor: [
      "Reklama kampaniyalarini tez ishga tushirish kerak bo'lganda",
      "ChatGPT dan professional natija olishni xohlasangiz",
      "Marketing kontent yaratishda vaqt tejashni istasangiz",
      "O'zbek tilida tushuntirilgan promtlar kerak bo'lganda",
    ],
    notIdealFor: [
      "Kodlash/dasturlash promtlari izlovchilar",
      "Ingliz tilini bilmaydigan foydalanuvchilar (promtlarning ba'zilari inglizcha)",
    ],
    keyBenefits: [
      "O'zbek tilida tushuntirilgan",
      "Real loyihalarda sinovdan o'tgan",
      "3.5+ yillik tajriba asosida",
      "Doimiy yangilanishlar",
    ],
    ctaText: "Promtlarni ko'rish",
    ctaLink: "/prompts",
  };

  // Comparison Table (AI crawlers uchun strukturalangan)
  const comparisonProducts: ComparisonProduct[] = [
    { name: "PromptsHub", isHighlighted: true, price: "Bepul / Premium" },
    { name: "PromptBase", price: "$4.99/promt" },
    { name: "AIPRM", price: "$9/oy" },
    { name: "O'zingiz yozish", price: "Bepul" },
  ];

  const comparisonFeatures: ComparisonFeature[] = [
    {
      name: "O'zbek tilida",
      description: "Mahalliy bozor uchun optimallashtirilgan",
      values: { "PromptsHub": true, "PromptBase": false, "AIPRM": false, "O'zingiz yozish": true },
    },
    {
      name: "Marketing ixtisoslashuvi",
      description: "Digital marketing uchun maxsus",
      values: { "PromptsHub": true, "PromptBase": "partial", "AIPRM": "partial", "O'zingiz yozish": false },
    },
    {
      name: "Video darsliklar",
      description: "Qo'llanma va treninglar",
      values: { "PromptsHub": true, "PromptBase": false, "AIPRM": false, "O'zingiz yozish": false },
    },
    {
      name: "Doimiy yangilanishlar",
      description: "Haftalik yangi promtlar",
      values: { "PromptsHub": true, "PromptBase": "partial", "AIPRM": true, "O'zingiz yozish": false },
    },
    {
      name: "Mahalliy to'lov",
      description: "O'zbekiston kartalaridan to'lash",
      values: { "PromptsHub": true, "PromptBase": false, "AIPRM": false, "O'zingiz yozish": true },
    },
    {
      name: "Qo'llab-quvvatlash",
      description: "Telegram orqali yordam",
      values: { "PromptsHub": true, "PromptBase": false, "AIPRM": "partial", "O'zingiz yozish": false },
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="PromptsHub - Marketing Promtlari Bazasi | AI Promtlar O'zbekistonda"
        description="Digital marketing uchun tayyor AI promtlar. Google Ads, Meta Ads, Yandex Direct promtlari. ChatGPT bilan professional natijalar. 500+ foydalanuvchi ishonchi."
        keywords={[
          "AI promtlar",
          "marketing promtlari", 
          "ChatGPT promtlar",
          "Google Ads promtlar",
          "Meta Ads promtlar",
          "digital marketing O'zbekiston",
          "SMM promtlar",
          "content marketing",
          "reklama promtlari",
          "AI marketing vositalari"
        ]}
        canonicalUrl="https://mpbs.uz"
        ogType="website"
      />
      <SchemaMarkup schemas={[organizationSchema, websiteSchema, softwareSchema, faqSchema]} />
      
      <Header />
      
      <main>
        <Hero />
        
        {/* Trust Signals - E-E-A-T */}
        <TrustSignals 
          signals={trustSignals} 
          title="Ishonch ko'rsatkichlari"
        />
        
        <Features />
        <Categories />
        
        {/* Best Fit Brief - AI/GEO Optimization */}
        <BestFitBrief data={bestFitData} />
        
        {/* Comparison Table - AI crawlers uchun */}
        <ComparisonTable
          title="Nima uchun PromptsHub?"
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
