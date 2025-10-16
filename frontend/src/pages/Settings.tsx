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
import { Languages } from "lucide-react";

interface SettingsProps {
  onPricingClick?: () => void;
}

const Settings = ({ onPricingClick }: SettingsProps) => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
  };

  // Get browser's preferred language for display
  const getBrowserLanguage = () => {
    const browserLang = navigator.language || "en";
    if (browserLang.startsWith("fr")) return "fr";
    if (browserLang.startsWith("en")) return "en";
    return "en";
  };

  const browserLang = getBrowserLanguage();
  const isUsingBrowserDefault = i18n.language === browserLang;

  return (
    <div className="min-h-screen w-screen overflow-y-auto bg-orange-50 pt-4 pb-8">
      <main className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Settings Cards */}
          <div className="grid gap-6">
            {/* Language Settings */}
            <Card className="bg-white/80 backdrop-blur-sm border border-orange-200 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                    <Languages className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-gray-900">
                      {t("navigation.language")}
                    </CardTitle>
                    <CardDescription>
                      {t("settings.languageDescription")}
                      {isUsingBrowserDefault && (
                        <span className="block text-green-600 text-sm mt-1">
                          ✓ {t("settings.usingBrowserLanguage")} (
                          {navigator.language})
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
