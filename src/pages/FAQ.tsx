import { motion } from "framer-motion";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SEOHead, SchemaMarkup, FAQSchema, Breadcrumb } from "@/components/seo";

const faqData = [
  {
    category: "Umumiy savollar",
    questions: [
      {
        q: "MPBS.uz nima?",
        a: "MPBS.uz — marketing uchun tayyor AI promtlar, onlayn video kurslar va bepul darslar platformasi. GPT, Claude, Gemini va boshqa AI vositalari uchun tayyor promtlarni topishingiz mumkin."
      },
      {
        q: "Promtlardan qanday foydalanaman?",
        a: "Promtni nusxalab, istalgan AI vositasiga (GPT, Claude, Gemini va h.k.) joylashtiring. O'zingizning ma'lumotlaringizni qo'shing va natija oling."
      },
      {
        q: "Platformada qanday kontentlar bor?",
        a: "AI promtlar bazasi, onlayn video kurslar, bepul video darslar va hamjamiyat chat xonalari mavjud. Barcha kontentlar o'zbek tilida."
      }
    ]
  },
  {
    category: "To'lov va obuna",
    questions: [
      {
        q: "Qanday to'lov usullari mavjud?",
        a: "Biz Click, Payme, va bank kartasi orqali to'lovlarni qabul qilamiz. Barcha to'lovlar xavfsiz va himoyalangan."
      },
      {
        q: "Obunani bekor qilsam nima bo'ladi?",
        a: "Obunani istalgan vaqtda bekor qilishingiz mumkin. Bekor qilganingizdan keyin ham obuna muddati tugaguncha xizmatdan foydalanishingiz mumkin."
      },
      {
        q: "Qaytarib olish siyosati bormi?",
        a: "Ha, agar 7 kun ichida xizmatdan qoniqmasangiz, to'liq pulni qaytarib olishingiz mumkin."
      }
    ]
  },
  {
    category: "Kurslar va darslar",
    questions: [
      {
        q: "Kurslardan qanday foydalanaman?",
        a: "Kursni sotib oling va barcha video darslarga, materiallarga va hamjamiyat chatiga kirish imkoniyatini oling."
      },
      {
        q: "Bepul darslar bormi?",
        a: "Ha, platformada bepul video darsliklar mavjud. Ularni ro'yxatdan o'tmasdan ham ko'rishingiz mumkin."
      },
      {
        q: "Promtlar qaysi AI vositalari bilan ishlaydi?",
        a: "Bizning promtlar GPT, Claude, Gemini, Mistral va boshqa zamonaviy AI modellar bilan ishlaydi."
      }
    ]
  }
];

const FAQ = () => {
  const faqQuestions = faqData.flatMap(section => 
    section.questions.map(q => ({
      question: q.q,
      answer: q.a
    }))
  );

  const faqSchema: FAQSchema = {
    type: "FAQPage",
    questions: faqQuestions
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Ko'p so'raladigan savollar (FAQ)"
        description="MPBS.uz haqida ko'p beriladigan savollar va javoblar. Promtlar, kurslar, darslar, to'lov va obuna savollari."
        keywords={["FAQ", "savollar", "yordam", "MPBS.uz", "AI promtlar", "kurslar"]}
        canonicalUrl="https://mpbs.uz/faq"
      />
      <SchemaMarkup schemas={[faqSchema]} />
      <Header />
      
      <main className="container mx-auto px-4 py-12 pt-24">
        <Breadcrumb items={[{ label: "FAQ" }]} className="mb-6" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-primary/10 rounded-xl">
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Ko'p so'raladigan savollar</h1>
              <p className="text-muted-foreground">Eng ko'p beriladigan savollarga javoblar</p>
            </div>
          </div>

          {faqData.map((section, sectionIndex) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: sectionIndex * 0.1 }}
              className="mb-8"
            >
              <h2 className="text-xl font-semibold text-foreground mb-4">{section.category}</h2>
              <Accordion type="single" collapsible className="space-y-2">
                {section.questions.map((item, index) => (
                  <AccordionItem
                    key={index}
                    value={`${sectionIndex}-${index}`}
                    className="bg-card border border-border rounded-lg px-4"
                  >
                    <AccordionTrigger className="text-left hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          ))}

          <div className="mt-12 p-6 bg-card border border-border rounded-xl text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">Savolingizga javob topa olmadingizmi?</h3>
            <p className="text-muted-foreground mb-4">Biz bilan bog'laning, yordam beramiz!</p>
            <Link to="/contact">
              <Button>Aloqa</Button>
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;