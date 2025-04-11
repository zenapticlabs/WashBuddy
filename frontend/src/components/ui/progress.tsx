"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    minValue?: number;
    maxValue?: number;
    onValueChange?: (value: number) => void;
  }
>(({ className, value, onValueChange, minValue = 0, maxValue = 100, ...props }, ref) => {
  const progressBarRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [progress, setProgress] = React.useState(value || minValue);

  const updateValue = React.useCallback((clientX: number) => {
    if (!progressBarRef.current || !onValueChange) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPosition = clientX - rect.left;
    const percentage = (clickPosition / rect.width) * 100;
    const clampedValue = Math.min(Math.max(percentage, 0), 100);

    const newValue = minValue + (clampedValue / 100) * (maxValue - minValue);
    setProgress(Math.round(newValue));
    onValueChange(Math.round(newValue));
  }, [minValue, maxValue, onValueChange]);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateValue(event.clientX);
  };

  const handleMouseMove = React.useCallback((event: MouseEvent) => {
    if (!isDragging) return;
    updateValue(event.clientX);
  }, [isDragging, updateValue]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateValue(event.touches[0].clientX);
  };

  const handleTouchMove = React.useCallback((event: TouchEvent) => {
    if (!isDragging) return;
    updateValue(event.touches[0].clientX);
  }, [isDragging, updateValue]);

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleTouchMove]);

  React.useEffect(() => {
    setProgress(value || minValue);
  }, [value, minValue]);

  return (
    <div className="flex items-center w-full">
      <div className="px-2">{minValue}</div>
      <div
        className="relative flex-1 cursor-pointer py-4"
        ref={progressBarRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <ProgressPrimitive.Root
          ref={ref}
          className={cn(
            "relative h-2 flex-1 w-full overflow-hidden rounded-full bg-primary/20",
            className
          )}
          {...props}
        >
          <ProgressPrimitive.Indicator
            className="h-full w-full flex-1 bg-blue-500"
            style={{
              transform: `translateX(-${100 - ((progress || minValue) - minValue) / (maxValue - minValue) * 100}%)`
            }}
          />
        </ProgressPrimitive.Root>
        <div
          className="absolute top-1/2 h-5 w-5 bg-blue-500 shadow-md -translate-y-1/2 rounded-full border-[4px] border-white pointer-events-none"
          style={{
            left: `${((progress || minValue) - minValue) / (maxValue - minValue) * 100}%`
          }}
        />
      </div>
      <div className="px-2">{maxValue}</div>
    </div>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
