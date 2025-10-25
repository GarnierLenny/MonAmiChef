import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles, Calendar, ShoppingCart, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface WelcomeModalProps {
  open: boolean;
  onComplete: (startTour: boolean) => void;
}

interface Slide {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  iconBg: string;
  iconColor: string;
}

export default function WelcomeModal({ open, onComplete }: WelcomeModalProps) {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const slides: Slide[] = [
    {
      id: 1,
      title: t('onboarding.welcomeModal.slide1.title'),
      description: t('onboarding.welcomeModal.slide1.description'),
      icon: <Sparkles className="w-full h-full" />,
      gradient: 'from-orange-500 via-orange-400 to-orange-300',
      iconBg: 'bg-white shadow-md',
      iconColor: 'text-orange-600',
    },
    {
      id: 2,
      title: t('onboarding.welcomeModal.slide2.title'),
      description: t('onboarding.welcomeModal.slide2.description'),
      icon: <Sparkles className="w-full h-full animate-pulse" />,
      gradient: 'from-orange-600 via-orange-500 to-orange-400',
      iconBg: 'bg-white shadow-md',
      iconColor: 'text-orange-700',
    },
    {
      id: 3,
      title: t('onboarding.welcomeModal.slide3.title'),
      description: t('onboarding.welcomeModal.slide3.description'),
      icon: <Calendar className="w-full h-full" />,
      gradient: 'from-amber-500 via-orange-500 to-orange-400',
      iconBg: 'bg-white shadow-md',
      iconColor: 'text-orange-600',
    },
    {
      id: 4,
      title: t('onboarding.welcomeModal.slide4.title'),
      description: t('onboarding.welcomeModal.slide4.description'),
      icon: <ShoppingCart className="w-full h-full" />,
      gradient: 'from-orange-600 via-orange-500 to-orange-500',
      iconBg: 'bg-white shadow-lg',
      iconColor: 'text-orange-800',
    },
  ];

  const isLastSlide = currentSlide === slides.length - 1;

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && !isLastSlide) {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' && currentSlide > 0) {
        e.preventDefault();
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentSlide, isLastSlide]);

  const handleNext = () => {
    if (isLastSlide) {
      onComplete(true); // Start tour
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  };

  const handleSkip = () => {
    onComplete(false); // Don't start tour
  };

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
  };

  const slide = slides[currentSlide];

  // Crossfade animation
  const slideVariants = {
    enter: {
      opacity: 0,
      scale: 0.98,
    },
    center: {
      opacity: 1,
      scale: 1,
    },
    exit: {
      opacity: 0,
      scale: 0.98,
    },
  };

  const transition = {
    duration: 0.35,
    ease: [0.32, 0.72, 0, 1], // Custom easing for smoothness
  };

  return (
    <Dialog open={open} onOpenChange={() => handleSkip()}>
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-[420px] p-0 overflow-hidden border-0 bg-transparent shadow-2xl gap-0"
        aria-describedby="onboarding-description"
      >
        {/* Screen reader announcement */}
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          Slide {currentSlide + 1} of {slides.length}: {slide.title}
        </div>

        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute right-3 top-3 z-30 rounded-full p-2 bg-white/95 backdrop-blur-sm hover:bg-white shadow-md transition-all duration-200 hover:scale-105"
          aria-label={t('onboarding.welcomeModal.closeAriaLabel')}
        >
          <X className="h-4 w-4 text-gray-600" />
        </button>

        {/* Content container with fixed height */}
        <div className="relative h-[540px] overflow-hidden">
          {/* Static container - no disappearing */}
          <div className="absolute inset-0 flex flex-col overflow-hidden rounded-lg">
            {/* Gradient background section - animated with Tailwind classes */}
            <div
              className={cn(
                "flex-1 bg-gradient-to-br px-6 py-8 text-center flex flex-col justify-center items-center rounded-t-lg transition-all duration-500 ease-in-out",
                slide.gradient
              )}
            >
              {/* Content wrapper with fade animation */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                  className="w-full"
                >
                {/* Icon */}
                <div className="flex justify-center mb-5">
                  <motion.div
                    initial={prefersReducedMotion ? { scale: 1, opacity: 1 } : { scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: prefersReducedMotion ? 0 : 0.15,
                      type: 'spring',
                      stiffness: 180,
                      damping: 15
                    }}
                    className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center",
                      slide.iconBg
                    )}
                  >
                    <div className={cn("w-8 h-8", slide.iconColor)}>
                      {slide.icon}
                    </div>
                  </motion.div>
                </div>

                {/* Title */}
                <DialogHeader className="space-y-3 w-full">
                  <DialogTitle className="text-xl font-bold text-white text-center leading-tight drop-shadow-md">
                    {slide.title}
                  </DialogTitle>
                </DialogHeader>

                {/* Description */}
                <p className="text-sm text-white leading-relaxed max-w-xs mx-auto mt-3 drop-shadow-md">
                  {slide.description}
                </p>
              </motion.div>
              {/* End content wrapper */}
              </AnimatePresence>
            </div>

            {/* Bottom navigation section - static, only buttons change */}
            <div className="bg-white px-5 py-6 space-y-6 rounded-b-lg">
                {/* Progress dots */}
                <div className="flex justify-center items-center gap-2">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleDotClick(index)}
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        index === currentSlide
                          ? 'w-8 bg-orange-500'
                          : 'w-2 bg-gray-300'
                      )}
                      aria-label={`Go to slide ${index + 1}`}
                      aria-current={index === currentSlide ? 'step' : undefined}
                    />
                  ))}
                </div>

                {/* Mobile-optimized button layout */}
                <div className="space-y-3">
                  {/* Primary action - Full width */}
                  <Button
                    onClick={handleNext}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 h-12"
                    size="lg"
                  >
                    {isLastSlide ? (
                      <>
                        {t('onboarding.welcomeModal.startTour')}
                        <Sparkles className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      t('onboarding.welcomeModal.next')
                    )}
                  </Button>

                  {/* Secondary actions row */}
                  <div className="flex items-center justify-center gap-4 text-sm">
                    {/* Counter */}
                    <span className="text-gray-500 font-medium">
                      {currentSlide + 1} / {slides.length}
                    </span>

                    {/* Divider */}
                    <span className="text-gray-300">•</span>

                    {/* Skip button */}
                    <button
                      onClick={handleSkip}
                      className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    >
                      {t('onboarding.welcomeModal.skip')}
                    </button>
                  </div>
                </div>

                {/* Last slide: Explore option */}
                {isLastSlide && (
                  <div className="text-center -mt-2">
                    <button
                      onClick={handleSkip}
                      className="text-sm text-gray-500 hover:text-gray-700 underline decoration-gray-400 underline-offset-4 transition-all"
                    >
                      {t('onboarding.welcomeModal.exploreOnOwn')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
      </DialogContent>
    </Dialog>
  );
}
