// src/components/landing/FinalCTA.tsx
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Sparkles } from "lucide-react";

export function FinalCTA() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const handleGetStarted = () => {
    navigate("/chat?welcome=true");
  };

  const benefits = [
    t('landing.finalCta.benefits.noCard'),
    t('landing.finalCta.benefits.freePlan'),
    t('landing.finalCta.benefits.unlimited'),
    t('landing.finalCta.benefits.cancel')
  ];

  return (
    <section ref={ref} className="relative py-20 bg-gradient-to-br from-orange-500 via-orange-600 to-pink-600 overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '30px 30px'
        }} />
      </div>

      {/* Floating elements */}
      <motion.div
        className="absolute top-10 right-10 text-6xl opacity-20"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, 0]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        ✨
      </motion.div>
      <motion.div
        className="absolute bottom-10 left-10 text-5xl opacity-20"
        animate={{
          y: [0, 20, 0],
          rotate: [0, -10, 0]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      >
        🍽️
      </motion.div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>{t('landing.finalCta.badge')}</span>
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {t('landing.finalCta.title')}
            <br />
            {t('landing.finalCta.titleContinued')}
          </h2>

          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            {t('landing.finalCta.subtitle')}
          </p>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-3xl mx-auto"
          >
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-white/90 text-sm md:text-base">
                <Check className="w-5 h-5 flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="w-full sm:w-auto bg-white text-orange-600 hover:bg-orange-50 hover:scale-105 transition-all duration-200 text-lg sm:text-xl px-6 sm:px-12 py-6 sm:py-8 rounded-2xl shadow-2xl group font-bold"
            >
              <span className="whitespace-nowrap">{t('landing.finalCta.cta')}</span>
              <ArrowRight className="ml-2 w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </Button>
          </motion.div>

          {/* Reassurance text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 text-white/80 text-sm"
          >
            ⚡ {t('landing.finalCta.reassurance')}
          </motion.p>
        </motion.div>

        {/* Social Proof Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 pt-12 border-t border-white/20"
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-white">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {['👨‍🍳', '👩‍🍳', '🧑‍🍳', '👨‍🍳', '👩‍🍳'].map((emoji, i) => (
                  <div key={i} className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/40 text-lg">
                    {emoji}
                  </div>
                ))}
              </div>
              <span className="ml-2 font-medium">10,000+ {t('landing.finalCta.socialProof')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="text-yellow-300 text-xl">★</div>
                ))}
              </div>
              <span className="font-medium">4.9/5 {t('landing.finalCta.rating')}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
