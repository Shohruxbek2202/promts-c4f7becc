import { Sparkles, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  platform: [
    { label: "Promtlar", href: "#" },
    { label: "Kategoriyalar", href: "#categories" },
    { label: "Narxlar", href: "#pricing" },
    { label: "Referral", href: "#referral" },
  ],
  support: [
    { label: "Yordam markazi", href: "#" },
    { label: "Telegram bot", href: "#" },
    { label: "FAQ", href: "#" },
    { label: "Aloqa", href: "#" },
  ],
  legal: [
    { label: "Foydalanish shartlari", href: "#" },
    { label: "Maxfiylik siyosati", href: "#" },
    { label: "To'lov shartlari", href: "#" },
  ],
};

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-secondary" />
              </div>
              <span className="font-display text-xl font-bold">
                PromptsHub
              </span>
            </a>
            <p className="text-primary-foreground/70 mb-6 max-w-sm">
              100,000+ professional marketing promtlari bazasi. 
              Vaqtingizni tejang, natijalaringizni oshiring.
            </p>
            <div className="space-y-2">
              <a href="mailto:info@shohruxdigital.uz" className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                <Mail className="w-4 h-4" />
                info@shohruxdigital.uz
              </a>
              <a href="tel:+998901234567" className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                <Phone className="w-4 h-4" />
                +998 90 123 45 67
              </a>
              <p className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <MapPin className="w-4 h-4" />
                Toshkent, O'zbekiston
              </p>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="font-display font-semibold mb-4">Platforma</h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold mb-4">Yordam</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold mb-4">Huquqiy</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/70">
            © 2025 ShohruxDigital.uz. Barcha huquqlar himoyalangan.
          </p>
          <div className="flex items-center gap-4">
            <a 
              href="#" 
              className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
              aria-label="Telegram"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.121.099.154.232.17.325.015.094.034.31.019.478z"/>
              </svg>
            </a>
            <a 
              href="#" 
              className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
              aria-label="Instagram"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
