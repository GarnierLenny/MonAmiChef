import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Languages, User, Bell } from "lucide-react";

const Settings = () => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
  };

  // Get browser's preferred language for display
  const getBrowserLanguage = () => {
    const browserLang = navigator.language || 'en';
    if (browserLang.startsWith('fr')) return 'fr';
    if (browserLang.startsWith('en')) return 'en';
    return 'en';
  };

  const browserLang = getBrowserLanguage();
  const isUsingBrowserDefault = i18n.language === browserLang;

  return (
    <div className="min-h-screen w-screen overflow-y-hidden bg-orange-50">
      <main className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Settings Cards */}
          <div className="grid gap-6">
            {/* Language Settings */}
            <Card className="bg-white/80 backdrop-blur-sm border border-chef-orange/20 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-chef-orange to-chef-yellow rounded-full flex items-center justify-center">
                    <Languages className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-chef-brown">
                      {t("navigation.language")}
                    </CardTitle>
                    <CardDescription>
                      {t('settings.languageDescription')}
                      {isUsingBrowserDefault && (
                        <span className="block text-green-600 text-sm mt-1">
                          ✓ {t('settings.usingBrowserLanguage')} ({navigator.language})
                        </span>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="max-w-xs">
                  <Select
                    value={i18n.language}
                    onValueChange={handleLanguageChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("navigation.language")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">
                        <div className="flex items-center gap-2">
                          🇺🇸 <span>{t("languages.en")}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="fr">
                        <div className="flex items-center gap-2">
                          🇫🇷 <span>{t("languages.fr")}</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Account Settings - Placeholder for future */}
            <Card className="bg-white/80 backdrop-blur-sm border border-chef-green/20 shadow-lg opacity-60">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-chef-green to-chef-yellow rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-chef-brown">
                      {t('settings.accountSettings')}
                    </CardTitle>
                    <CardDescription>
                      {t('settings.accountDescription')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Notifications - Placeholder for future */}
            <Card className="bg-white/80 backdrop-blur-sm border border-chef-brown/20 shadow-lg opacity-60">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-chef-brown to-chef-orange rounded-full flex items-center justify-center">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-chef-brown">
                      {t('settings.notifications')}
                    </CardTitle>
                    <CardDescription>
                      {t('settings.notificationsDescription')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;

