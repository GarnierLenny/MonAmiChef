import React, { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface AnimatedProgressProps {
  value: number;
  className?: string;
  duration?: number;
  delay?: number;
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({
  value,
  className = "",
  duration = 800,
  delay = 0,
}) => {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsAnimating(true);
      const startTime = Date.now();
      const startValue = 0;
      const difference = value - startValue;

      const easeOutQuart = (t: number): number => {
        return 1 - Math.pow(1 - t, 4);
      };

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const easedProgress = easeOutQuart(progress);
        const currentValue = startValue + (difference * easedProgress);

        setCurrent(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCurrent(value);
          setIsAnimating(false);
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      setIsAnimating(false);
    };
  }, [value, duration, delay]);

  return (
    <Progress
      value={current}
      className={cn(className)}
    />
  );
};