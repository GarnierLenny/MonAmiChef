// src/components/landing/HeroSection.tsx
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { LanguageSelector } from "./LanguageSelector";

export function HeroSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleGetStarted = () => {
    navigate("/chat?welcome=true");
  };

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById("features");
    featuresSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-orange-400 via-orange-500 to-pink-500">
      {/* Language Selector - Top Right */}
      <div className="absolute top-6 right-6 z-50">
        <LanguageSelector />
      </div>

      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Floating Food Emoji Decorations */}
      <motion.div
        className="absolute top-20 left-10 text-6xl"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, 0],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        🍅
      </motion.div>
      <motion.div
        className="absolute top-40 right-20 text-5xl"
        animate={{
          y: [0, 20, 0],
          rotate: [0, -10, 0],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      >
        🥗
      </motion.div>
      <motion.div
        className="absolute bottom-40 left-20 text-7xl"
        animate={{
          y: [0, -15, 0],
          rotate: [0, 15, 0],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      >
        🥘
      </motion.div>
      <motion.div
        className="absolute bottom-20 right-10 text-5xl"
        animate={{
          y: [0, 25, 0],
          rotate: [0, -15, 0],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{
          duration: 3.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5
        }}
      >
        🍳
      </motion.div>

      {/* Additional Food Emojis */}
      <motion.div
        className="absolute top-32 left-1/4 text-4xl"
        animate={{
          y: [0, -18, 0],
          rotate: [0, 12, 0],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.3
        }}
      >
        🍕
      </motion.div>
      <motion.div
        className="absolute top-1/3 right-1/4 text-5xl"
        animate={{
          y: [0, 22, 0],
          rotate: [0, -8, 0],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.8
        }}
      >
        🍝
      </motion.div>
      <motion.div
        className="absolute bottom-1/3 left-1/3 text-6xl"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, 0],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.2
        }}
      >
        🥑
      </motion.div>
      <motion.div
        className="absolute bottom-32 right-1/3 text-4xl"
        animate={{
          y: [0, 15, 0],
          rotate: [0, -12, 0],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
          duration: 3.6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.8
        }}
      >
        🍜
      </motion.div>
      <motion.div
        className="absolute top-1/4 right-12 text-5xl"
        animate={{
          y: [0, -25, 0],
          rotate: [0, 8, 0],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
          duration: 4.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.6
        }}
      >
        🥐
      </motion.div>
      <motion.div
        className="absolute bottom-1/4 left-16 text-4xl"
        animate={{
          y: [0, 20, 0],
          rotate: [0, -10, 0],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
          duration: 3.4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.4
        }}
      >
        🍇
      </motion.div>
      <motion.div
        className="absolute top-2/3 left-12 text-5xl"
        animate={{
          y: [0, -22, 0],
          rotate: [0, 14, 0],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
          duration: 3.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      >
        🥦
      </motion.div>
      <motion.div
        className="absolute top-1/2 right-16 text-4xl"
        animate={{
          y: [0, 18, 0],
          rotate: [0, -11, 0],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.9
        }}
      >
        🍓
      </motion.div>
      <motion.div
        className="absolute top-3/4 left-1/4 text-5xl"
        animate={{
          y: [0, -16, 0],
          rotate: [0, 9, 0],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.6
        }}
      >
        🥕
      </motion.div>
      <motion.div
        className="absolute bottom-1/2 right-1/4 text-4xl"
        animate={{
          y: [0, 24, 0],
          rotate: [0, -13, 0],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
          duration: 3.6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2.2
        }}
      >
        🌮
      </motion.div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>{t('landing.hero.badge')}</span>
          </div>
        </motion.div>

        {/* Logo as standalone element */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mb-6"
        >
          <img
            src="/monamichef_square.png"
            alt="Mon Ami Chef"
            className="w-20 h-20 md:w-28 md:h-28 object-contain mx-auto drop-shadow-2xl rounded-2xl"
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
        >
          {t('landing.hero.title')}
          <br />
          {t('landing.hero.titleContinued')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto"
        >
          {t('landing.hero.subtitle')}
          <br />
          {t('landing.hero.subtitleContinued')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
        >
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="w-full sm:w-64 bg-white text-orange-600 hover:bg-orange-50 hover:scale-105 transition-all duration-200 text-lg px-8 py-6 rounded-xl shadow-2xl group"
          >
            {t('landing.hero.ctaPrimary')}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={scrollToFeatures}
            className="w-full sm:w-64 bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 rounded-xl"
          >
            {t('landing.hero.ctaSecondary')}
            <ChevronDown className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-white/80 text-sm"
        >
          ✨ {t('landing.hero.socialProof')}
        </motion.p>

        {/* Animated Mockup Preview (Optional - using simple gradient card for now) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl">
            <div className="bg-gradient-to-br from-white/20 to-white/5 rounded-xl p-6 min-h-[300px] flex items-center justify-center">
              <div className="text-white/60 text-center">
                <Sparkles className="w-16 h-16 mx-auto mb-4 animate-pulse" />
                <p className="text-lg font-medium">
                  "Make me a healthy Italian dinner for 4"
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="w-8 h-8 text-white/60" />
        </motion.div>
      </motion.div>
    </section>
  );
}
