import { useState, useEffect } from "react";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Categories } from "@/components/landing/Categories";
import { Pricing } from "@/components/landing/Pricing";
import { Referral } from "@/components/landing/Referral";
import { Footer } from "@/components/landing/Footer";
import { supabase } from "@/integrations/supabase/client";

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        <Categories />
        {showPricing && <Pricing />}
        {showReferral && <Referral />}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
