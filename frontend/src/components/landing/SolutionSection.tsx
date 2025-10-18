// src/components/landing/SolutionSection.tsx
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useTranslation } from "react-i18next";
import {
  MessageSquare,
  Calendar,
  ShoppingCart,
  ArrowRight,
} from "lucide-react";

export function SolutionSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const { t } = useTranslation();

  const steps = [
    {
      icon: MessageSquare,
      title: t('landing.solution.step1.title'),
      description: t('landing.solution.step1.description'),
      color: "from-orange-400 to-orange-600",
      delay: 0,
    },
    {
      icon: Calendar,
      title: t('landing.solution.step2.title'),
      description: t('landing.solution.step2.description'),
      color: "from-orange-500 to-pink-500",
      delay: 0.2,
    },
    {
      icon: ShoppingCart,
      title: t('landing.solution.step3.title'),
      description: t('landing.solution.step3.description'),
      color: "from-pink-400 to-pink-600",
      delay: 0.4,
    },
  ];

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('landing.solution.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('landing.solution.subtitle')}
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 md:gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.12,
                      ease: [0.25, 0.1, 0.25, 1]
                    }}
                    className="relative"
                  >
                    {/* Card with integrated step number badge */}
                    <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-8 h-full border border-orange-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                      {/* Step Number Badge - Top Right Corner */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={inView ? { scale: 1 } : {}}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                          delay: index * 0.12 + 0.2
                        }}
                        className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ring-4 ring-white"
                      >
                        {index + 1}
                      </motion.div>

                      <div className="mb-6">
                        <div
                          className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-lg`}
                        >
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>

                  {/* Arrow connecting steps (desktop only) */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-0">
                      <ArrowRight className="w-8 h-8 text-orange-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
