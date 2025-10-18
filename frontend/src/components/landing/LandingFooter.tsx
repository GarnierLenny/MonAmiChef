// src/components/landing/LandingFooter.tsx
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChefHat, Twitter, Instagram, Facebook, Mail, Heart } from "lucide-react";

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com/monamichef", label: "Twitter" },
  { icon: Instagram, href: "https://instagram.com/monamichef", label: "Instagram" },
  { icon: Facebook, href: "https://facebook.com/monamichef", label: "Facebook" },
  { icon: Mail, href: "mailto:hello@monamichef.com", label: "Email" }
];

export function LandingFooter() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  const footerLinks = {
    product: [
      { label: t('landing.footer.features'), href: "#features" },
      { label: t('landing.footer.pricing'), href: "#pricing" },
      { label: t('landing.footer.faq'), href: "#faq" },
    ],
    company: [
      { label: t('landing.footer.about'), href: "/about" },
      { label: t('landing.footer.blog'), href: "/blog" },
      { label: t('landing.footer.contact'), href: "/contact" },
    ],
    legal: [
      { label: t('landing.footer.privacy'), href: "/privacy" },
      { label: t('landing.footer.terms'), href: "/terms" },
      { label: t('landing.footer.cookies'), href: "/cookies" },
    ],
    resources: [
      { label: t('landing.footer.recipeGenerator'), href: "/" },
      { label: t('landing.footer.mealPlanner'), href: "/meal-plan-chat" },
      { label: t('navigation.groceryList'), href: "/grocery-list" },
    ]
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img
                src="/monamichef_square.png"
                alt="Mon Ami Chef"
                className="w-10 h-10 object-contain rounded-lg"
              />
              <span className="text-xl font-bold text-white">Mon Ami Chef</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              {t('landing.footer.tagline')}
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-br hover:from-orange-500 hover:to-pink-500 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('landing.footer.product')}</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="hover:text-orange-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('landing.footer.company')}</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="hover:text-orange-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('landing.footer.resources')}</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="hover:text-orange-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('landing.footer.legal')}</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="hover:text-orange-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} {t('landing.footer.copyright')}
            </p>
            <p className="text-sm text-gray-400 flex items-center gap-2">
              {t('landing.footer.madeWith')} <Heart className="w-4 h-4 text-red-500 fill-red-500" /> {t('landing.footer.forCooks')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
