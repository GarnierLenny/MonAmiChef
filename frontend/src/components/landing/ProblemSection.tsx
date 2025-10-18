// src/components/landing/ProblemSection.tsx
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useTranslation } from "react-i18next";
import { Calendar, Trash2, RefreshCw } from "lucide-react";

export function ProblemSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  const { t } = useTranslation();

  const problems = [
    {
      icon: Calendar,
      title: t('landing.problem.endless.title'),
      description: t('landing.problem.endless.description'),
      color: "text-gray-500"
    },
    {
      icon: Trash2,
      title: t('landing.problem.foodWaste.title'),
      description: t('landing.problem.foodWaste.description'),
      color: "text-gray-500"
    },
    {
      icon: RefreshCw,
      title: t('landing.problem.recipeFatigue.title'),
      description: t('landing.problem.recipeFatigue.description'),
      color: "text-gray-500"
    }
  ];

  return (
    <section ref={ref} className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('landing.problem.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('landing.problem.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.4,
                  delay: index * 0.08,
                  ease: [0.25, 0.1, 0.25, 1]
                }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={inView ? { scale: 1 } : {}}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      delay: index * 0.08 + 0.15
                    }}
                    className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center"
                  >
                    <Icon className={`w-8 h-8 ${problem.color}`} />
                  </motion.div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {problem.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {problem.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
