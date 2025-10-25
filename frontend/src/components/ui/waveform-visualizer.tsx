import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface WaveformVisualizerProps {
  className?: string;
  barCount?: number;
  color?: "red" | "orange" | "blue";
  audioLevel?: number; // 0-100 representing audio input level
}

export const WaveformVisualizer = ({
  className,
  barCount = 4,
  color = "red",
  audioLevel = 0,
}: WaveformVisualizerProps) => {
  const [tick, setTick] = useState(0);

  // Force re-render for baseline animation
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 50); // Update every 50ms for smooth animation

    return () => clearInterval(interval);
  }, []);

  const colorClasses = {
    red: "bg-red-500",
    orange: "bg-orange-500",
    blue: "bg-blue-500",
  };

  // Calculate bar heights based on audio level
  // Each bar gets a slightly different multiplier for wave effect
  const getBarHeight = (index: number) => {
    const minHeight = 6; // Minimum height in pixels (slightly larger)
    const maxHeight = 24; // Maximum height in pixels (taller for more dramatic effect)

    // Create a wave pattern by varying the multiplier for each bar
    const waveOffset = Math.sin((index / barCount) * Math.PI * 2);
    const multiplier = 0.6 + (waveOffset * 0.4); // 0.2 to 1.0 (more variation)

    // Calculate height based on audio level
    const level = audioLevel / 100; // Normalize to 0-1

    // Add a subtle baseline animation when audio level is low to show it's active
    const baselineAnimation = Math.sin(tick / 10 + index) * 0.15 + 0.15;
    const combinedLevel = level > 0.05 ? level : baselineAnimation;

    const height = minHeight + (maxHeight - minHeight) * combinedLevel * multiplier;

    return Math.max(minHeight, Math.min(maxHeight, height));
  };

  return (
    <div className={cn("flex items-center gap-0.5 h-5", className)}>
      {Array.from({ length: barCount }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "w-0.5 rounded-full transition-all duration-75 ease-out",
            colorClasses[color]
          )}
          style={{
            height: `${getBarHeight(index)}px`,
          }}
        />
      ))}
    </div>
  );
};
