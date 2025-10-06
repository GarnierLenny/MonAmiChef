import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root className="relative h-4 w-full shadow-[inset_0_1px_4px_rgba(0,0,0,0.4)] overflow-hidden rounded-full bg-background-light p-[3px]">
    <ProgressPrimitive.Indicator
      className="h-full rounded-full mb-[13px] shadow-[0_1px_1px_rgba(0,0,0,0.4)] bg-green-500 transition-all"
      style={{ width: `${Math.max(0, Math.min(100, value ?? 0))}%` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
