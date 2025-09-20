import React, { useEffect, useState } from "react";

interface CountUpProps {
  end: number;
  start?: number;
  duration?: number;
  className?: string;
  suffix?: string;
  decimals?: number;
}

export const CountUp: React.FC<CountUpProps> = ({
  end,
  start = 0,
  duration = 800,
  className = "",
  suffix = "",
  decimals = 0,
}) => {
  const [current, setCurrent] = useState(start);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (current === end) return;

    setIsAnimating(true);
    const startTime = Date.now();
    const startValue = current;
    const difference = end - startValue;

    const easeOutQuart = (t: number): number => {
      return 1 - Math.pow(1 - t, 4);
    };

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easedProgress = easeOutQuart(progress);
      const value = startValue + (difference * easedProgress);

      setCurrent(value);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCurrent(end);
        setIsAnimating(false);
      }
    };

    const timeoutId = setTimeout(() => {
      requestAnimationFrame(animate);
    }, 50); // Small delay to ensure smooth transition

    return () => {
      clearTimeout(timeoutId);
      setIsAnimating(false);
    };
  }, [end, duration]);

  const displayValue = decimals > 0
    ? current.toFixed(decimals)
    : Math.round(current).toString();

  return (
    <span className={className}>
      {displayValue}{suffix}
    </span>
  );
};