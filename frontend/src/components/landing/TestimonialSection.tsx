// src/components/landing/TestimonialSection.tsx
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useTranslation } from "react-i18next";
import Marquee from "react-fast-marquee";
import { Star } from "lucide-react";

const getTestimonials = (t: any) => [
  {
    name: t('landing.testimonials.busyMom.name'),
    role: t('landing.testimonials.busyMom.role'),
    content: t('landing.testimonials.busyMom.quote'),
    rating: 5,
    avatar: "👩‍🍳"
  },
  {
    name: t('landing.testimonials.homeCook.name'),
    role: t('landing.testimonials.homeCook.role'),
    content: t('landing.testimonials.homeCook.quote'),
    rating: 5,
    avatar: "👨‍🍳"
  },
  {
    name: t('landing.testimonials.fitness.name'),
    role: t('landing.testimonials.fitness.role'),
    content: t('landing.testimonials.fitness.quote'),
    rating: 5,
    avatar: "💪"
  },
  {
    name: t('landing.testimonials.beginner.name'),
    role: t('landing.testimonials.beginner.role'),
    content: t('landing.testimonials.beginner.quote'),
    rating: 5,
    avatar: "🔰"
  },
  {
    name: t('landing.testimonials.vegetarian.name'),
    role: t('landing.testimonials.vegetarian.role'),
    content: t('landing.testimonials.vegetarian.quote'),
    rating: 5,
    avatar: "🌱"
  },
  {
    name: t('landing.testimonials.mealPrep.name'),
    role: t('landing.testimonials.mealPrep.role'),
    content: t('landing.testimonials.mealPrep.quote'),
    rating: 5,
    avatar: "📅"
  }
];

export function TestimonialSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  const { t } = useTranslation();
  const testimonials = getTestimonials(t);

  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-white to-orange-50 overflow-hidden">
      <div className="container mx-auto px-4 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('landing.testimonials.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('landing.testimonials.subtitle')}
          </p>
        </motion.div>
      </div>

      {/* Scrolling Testimonials */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Marquee gradient={false} speed={40} pauseOnHover={true}>
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </Marquee>

        {/* Second row with reverse direction */}
        <div className="mt-6">
          <Marquee gradient={false} speed={40} direction="right" pauseOnHover={true}>
            {[...testimonials].reverse().map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </Marquee>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="container mx-auto px-4 mt-16"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {[
            { value: "10,000+", label: t('landing.testimonials.stats.activeUsers') },
            { value: "50,000+", label: t('landing.testimonials.stats.recipesGenerated') },
            { value: "4.9/5", label: t('landing.testimonials.stats.userRating') },
            { value: "95%", label: t('landing.testimonials.stats.wouldRecommend') }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: typeof testimonials[0] }) {
  return (
    <div className="mx-3 w-[350px] bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
      {/* Rating */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        ))}
      </div>

      {/* Content */}
      <p className="text-gray-700 mb-6 leading-relaxed">
        "{testimonial.content}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-2xl">
          {testimonial.avatar}
        </div>
        <div>
          <div className="font-semibold text-gray-900">
            {testimonial.name}
          </div>
          <div className="text-sm text-gray-500">
            {testimonial.role}
          </div>
        </div>
      </div>
    </div>
  );
}
