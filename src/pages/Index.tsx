import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Categories } from "@/components/landing/Categories";
import { Pricing } from "@/components/landing/Pricing";
import { Referral } from "@/components/landing/Referral";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        <Categories />
        <Pricing />
        <Referral />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
