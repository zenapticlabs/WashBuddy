"use client";

import * as React from "react";
import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface RateProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: number;
  max?: number;
}

const Rate = React.forwardRef<HTMLDivElement, RateProps>(
  ({ value = 0, max = 5, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("flex gap-1", className)} {...props}>
        {[...Array(max)].map((_, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <Star
              className={cn(
                "h-7 w-7 cursor-pointer",
                index < value
                  ? "fill-default-yellow text-default-yellow"
                  : "fill-none text-default-yellow"
              )}
            />
          </div>
        ))}
      </div>
    );
  }
);
Rate.displayName = "Rate";

export { Rate };
