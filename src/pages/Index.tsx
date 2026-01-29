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

const Index = () => {
  const [sectionSettings, setSectionSettings] = useState<SectionSettings>({
    show_pricing: true,
    show_referral: true,
  });
  const [hasActivePlans, setHasActivePlans] = useState(false);

  useEffect(() => {
    fetchSettings();
    checkActivePlans();
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
    description: "Digital marketing mutaxassislari uchun tayyor AI promtlar bazasi. ChatGPT, Google Ads, Meta Ads uchun optimallashtirilgan.",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      price: "0",
      priceCurrency: "UZS",
    },
    aggregateRating: {
      ratingValue: 4.8,
      reviewCount: 150,
      bestRating: 5,
    },
    author: {
      name: "PromptsHub",
      url: "https://mpbs.uz",
    },
    featureList: [
      "500+ tayyor marketing promtlari",
      "Google Ads uchun promtlar",
      "Meta Ads uchun promtlar", 
      "Yandex Direct promtlari",
      "Har hafta yangi promtlar",
      "Video darsliklar"
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
        answer: "PromptsHub - bu digital marketing mutaxassislari uchun tayyor AI promtlar bazasi. ChatGPT, Google Ads, Meta Ads va boshqa platformalar uchun optimallashtirilgan promtlarni topishingiz mumkin."
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
        question: "Qaysi platformalar uchun promtlar bor?",
        answer: "Google Ads, Meta Ads (Facebook, Instagram), Yandex Direct, TikTok Ads, LinkedIn Ads, Email marketing va Content marketing uchun promtlar mavjud."
      },
      {
        question: "Promtlar qanchalik samarali?",
        answer: "Bizning promtlarimiz 150+ marketing mutaxassisi tomonidan sinovdan o'tkazilgan va o'rtacha 40% vaqtni tejaydi."
      }
    ]
  };

  // E-E-A-T Trust Signals
  const trustSignals: TrustSignal[] = [
    { icon: "users", value: "500+", label: "Foydalanuvchilar" },
    { icon: "star", value: "4.8", label: "O'rtacha baho" },
    { icon: "check", value: "150+", label: "Tayyor promtlar" },
    { icon: "award", value: "3+", label: "Yillik tajriba" },
  ];

  // Best Fit Brief (AI/GEO optimization)
  const bestFitData: BestFitInfo = {
    title: "PromptsHub kimlar uchun?",
    subtitle: "AI promtlar bazasidan maksimal foyda olish uchun",
    tag: "2026 SaaS SEO",
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
      "Yangi marketing g'oyalar kerak bo'lganda",
    ],
    notIdealFor: [
      "Kodlash/dasturlash promtlari izlovchilar",
      "Shaxsiy foydalanish uchun",
    ],
    keyBenefits: [
      "40% vaqt tejash",
      "Professional natijalar",
      "Doimiy yangilanishlar",
      "O'zbek tilida",
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
