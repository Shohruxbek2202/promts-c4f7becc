import { motion } from "framer-motion";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  MapPin,
  Send
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SEOHead, Breadcrumb } from "@/components/seo";
import { useContactSettings } from "@/hooks/useContactSettings";

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { settings } = useContactSettings();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Xabaringiz yuborildi! Tez orada javob beramiz.");
    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Biz bilan bog'laning"
        description="PromptsHub bilan bog'laning. Savollar, takliflar yoki yordam uchun biz bilan bog'laning."
        keywords={["aloqa", "bog'lanish", "contact", "yordam"]}
        canonicalUrl="https://mpbs.uz/contact"
      />
      <Header />
      
      <main className="container mx-auto px-4 py-12 pt-24">
        <Breadcrumb items={[{ label: "Aloqa" }]} className="mb-6" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-primary/10 rounded-xl">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Aloqa</h1>
              <p className="text-muted-foreground">Biz bilan bog'laning</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Xabar yuborish</CardTitle>
                  <CardDescription>
                    Formani to'ldiring, biz tez orada javob beramiz
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Ism</Label>
                      <Input 
                        id="name" 
                        placeholder="Ismingiz" 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="email@example.com" 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon (ixtiyoriy)</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        placeholder="+998 90 123 45 67" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Xabar</Label>
                      <Textarea 
                        id="message" 
                        placeholder="Xabaringizni yozing..." 
                        rows={4}
                        required 
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Yuborilmoqda..." : "Yuborish"}
                      <Send className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Email</h3>
                      <a 
                        href={`mailto:${settings.email}`}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {settings.email}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Telefon</h3>
                      <a 
                        href={`tel:${settings.phone.replace(/\s/g, '')}`}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {settings.phone}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Manzil</h3>
                      <p className="text-muted-foreground">
                        {settings.address}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">Ijtimoiy tarmoqlar</h3>
                  <div className="flex gap-3">
                    <a 
                      href={settings.telegram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                      aria-label="Telegram"
                    >
                      <svg className="w-5 h-5 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.121.099.154.232.17.325.015.094.034.31.019.478z"/>
                      </svg>
                    </a>
                    <a 
                      href={settings.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                      aria-label="Instagram"
                    >
                      <svg className="w-5 h-5 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                      </svg>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
