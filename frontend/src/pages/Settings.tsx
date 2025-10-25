import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import { Languages, GraduationCap, PlayCircle } from "lucide-react";
import { resetOnboarding } from "../lib/onboarding-state";
import { useToast } from "@/hooks/use-toast";

interface SettingsProps {
  onPricingClick?: () => void;
}

const Settings = ({ onPricingClick }: SettingsProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
  };

  const handleRestartTour = () => {
    resetOnboarding();
    toast({
      title: t("settings.tourReset"),
      description: t("settings.tourResetDescription"),
      duration: 3000,
    });
    // Navigate to chat to trigger tour
    setTimeout(() => {
      navigate("/chat");
    }, 500);
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
            {/* Help & Onboarding */}
            <Card className="bg-white/80 backdrop-blur-sm border border-orange-200 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-gray-900">
                      {t("settings.helpOnboarding")}
                    </CardTitle>
                    <CardDescription>
                      {t("settings.helpOnboardingDescription")}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    {t("settings.newToMonAmiChef")}
                  </p>
                  <Button
                    onClick={handleRestartTour}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    {t("settings.restartProductTour")}
                  </Button>
                </div>
              </CardContent>
            </Card>

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
