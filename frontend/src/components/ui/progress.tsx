"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    value?: number;
    onChange?: (value: number) => void;
  }
>(({ className, value = 0, onChange, ...props }, ref) => {
  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const newValue = Math.round((x / rect.width) * 100);
      const clampedValue = Math.max(0, Math.min(100, newValue));
      onChange?.(clampedValue);
    },
    [onChange]
  );

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full rounded-full bg-primary/20 cursor-pointer",
        className
      )}
      onClick={handleClick}
      value={value}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-default-blue transition-all relative"
        style={{ transform: `translateX(-${100 - value}%)` }}
      >
        <div className="absolute right-0 top-1/2 h-5 w-5 bg-default-blue shadow-md -translate-y-1/2 translate-x-1/2 rounded-full border-[4px] border-white" />
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
