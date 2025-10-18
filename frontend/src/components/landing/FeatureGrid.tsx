// src/components/landing/FeatureGrid.tsx
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useTranslation } from "react-i18next";
import {
  MessageSquare,
  Calendar,
  ShoppingCart,
  TrendingUp,
  Timer,
  BookOpen,
  Sparkles,
  Users,
  Utensils
} from "lucide-react";

const getFeatures = (t: any) => [
  {
    icon: MessageSquare,
    title: t('landing.features.aiRecipe.title'),
    description: t('landing.features.aiRecipe.description'),
    gradient: "from-orange-400 to-orange-600",
    size: "large", // 2 columns on desktop
    visual: (
      <div className="bg-white/50 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex gap-2 mb-3">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 bg-white rounded-lg p-2 text-sm text-gray-700 font-normal">
            Quick pasta recipe
          </div>
        </div>
        <div className="flex gap-2 flex-row-reverse">
          <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-sm text-gray-600 font-normal">
            🍝 Creamy Garlic Parmesan...
          </div>
        </div>
      </div>
    )
  },
  {
    icon: Calendar,
    title: t('landing.features.mealPlanner.title'),
    description: t('landing.features.mealPlanner.description'),
    gradient: "from-pink-400 to-pink-600",
    size: "large",
    visual: (
      <div className="grid grid-cols-7 gap-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
          <div key={i} className="text-center">
            <div className="text-xs font-medium text-white/80 mb-1">{day}</div>
            <div className="bg-white/30 rounded aspect-square flex items-center justify-center text-lg">
              {['🥗', '🍝', '🍗', '🥘', '🍜', '🍕', '🍱'][i]}
            </div>
          </div>
        ))}
      </div>
    )
  },
  {
    icon: ShoppingCart,
    title: t('landing.features.groceryList.title'),
    description: t('landing.features.groceryList.description'),
    gradient: "from-orange-500 to-pink-500",
    size: "medium",
    visual: (
      <div className="space-y-2">
        {['🥬 Fresh Basil', '🍅 Cherry Tomatoes', '🧀 Parmesan'].map((item, i) => (
          <div key={i} className="flex items-center gap-2 bg-white/30 rounded-lg p-2">
            <div className="w-4 h-4 border-2 border-white rounded" />
            <span className="text-sm text-white">{item}</span>
          </div>
        ))}
      </div>
    )
  },
  {
    icon: TrendingUp,
    title: t('landing.features.nutrition.title'),
    description: t('landing.features.nutrition.description'),
    gradient: "from-green-400 to-green-600",
    size: "medium",
    visual: (
      <div className="flex justify-center items-center h-full">
        <div className="relative w-24 h-24">
          <svg className="transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="8" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="62.8" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-white font-bold">75%</div>
        </div>
      </div>
    )
  },
  {
    icon: Timer,
    title: t('landing.features.tools.title'),
    description: t('landing.features.tools.description'),
    gradient: "from-blue-400 to-blue-600",
    size: "small",
    visual: (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Timer className="w-12 h-12 text-white mx-auto mb-2 animate-pulse" />
          <div className="text-2xl font-bold text-white">12:45</div>
        </div>
      </div>
    )
  },
  {
    icon: BookOpen,
    title: t('landing.features.collection.title'),
    description: t('landing.features.collection.description'),
    gradient: "from-purple-400 to-purple-600",
    size: "small",
    visual: (
      <div className="flex items-center justify-center h-full">
        <div className="relative">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute bg-white/40 rounded-lg w-16 h-20 border border-white/40"
              style={{
                transform: `rotate(${(i - 1) * 8}deg) translateY(${i * 2}px)`,
                zIndex: 3 - i
              }}
            />
          ))}
        </div>
      </div>
    )
  }
];

export function FeatureGrid() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.05
  });
  const { t } = useTranslation();
  const features = getFeatures(t);

  return (
    <section id="features" ref={ref} className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('landing.features.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('landing.features.subtitle')}
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="max-w-6xl mx-auto">
          {/* Mobile: Stack vertically */}
          <div className="grid grid-cols-1 md:hidden gap-4">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} inView={inView} />
            ))}
          </div>

          {/* Desktop: Bento layout */}
          <div className="hidden md:grid grid-cols-4 gap-4 auto-rows-[200px]">
            {/* Row 1: AI Recipe (2 cols) + Meal Planner (2 cols) */}
            <div className="col-span-2 row-span-2">
              <FeatureCard feature={features[0]} index={0} inView={inView} />
            </div>
            <div className="col-span-2 row-span-2">
              <FeatureCard feature={features[1]} index={1} inView={inView} />
            </div>

            {/* Row 2: Grocery Lists (2 cols) + Nutrition (2 cols) */}
            <div className="col-span-2 row-span-1">
              <FeatureCard feature={features[2]} index={2} inView={inView} />
            </div>
            <div className="col-span-2 row-span-1">
              <FeatureCard feature={features[3]} index={3} inView={inView} />
            </div>

            {/* Row 3: Cooking Tools (2 cols) + Recipe Collection (2 cols) */}
            <div className="col-span-2 row-span-1">
              <FeatureCard feature={features[4]} index={4} inView={inView} />
            </div>
            <div className="col-span-2 row-span-1">
              <FeatureCard feature={features[5]} index={5} inView={inView} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature, index, inView }: { feature: any; index: number; inView: boolean }) {
  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      className={`bg-gradient-to-br ${feature.gradient} rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group h-full flex flex-col overflow-hidden`}
    >
      <div className="flex items-start justify-between mb-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: index * 0.05 + 0.1
          }}
          className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform"
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>
        <Sparkles className="w-5 h-5 text-white/60" />
      </div>

      <h3 className="text-xl font-bold text-white mb-2">
        {feature.title}
      </h3>
      <p className="text-white/80 text-sm mb-4 flex-grow">
        {feature.description}
      </p>

      {/* Visual Preview */}
      {feature.visual && (
        <div className="mt-auto">
          {feature.visual}
        </div>
      )}
    </motion.div>
  );
}
