"use client";

import * as React from "react";
import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface RateProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: number;
  max?: number;
  size?: string;
  fullWidth?: boolean;
  color?: string;
  textColor?: string;
  readonly?: boolean;
}

const Rate = React.forwardRef<HTMLDivElement, RateProps>(
  (
    {
      value = 0,
      max = 5,
      className,
      size = "xs",
      fullWidth = false,
      color = "default-yellow",
      textColor = "default-yellow",
      readonly = false,
      ...props
    },
    ref
  ) => {
    const starSize =
      size === "xs" ? 3 : size === "sm" ? 6 : size === "md" ? 8 : 10;
    const padding =
      size === "xs" ? 0.5 : size === "sm" ? 0.75 : size === "md" ? 1 : 1.5;
    const getStar = (index: number) => {
      // Calculate the whole number and decimal parts
      const whole = Math.floor(value);
      const decimal = value - whole;
      
      // Determine if we should show a half star
      const showHalfStar = decimal >= 0.5;
      
      // Full star
      if (index < whole) {
        return (
          <Star
            className={`h-${starSize} w-${starSize} ${!readonly ? 'cursor-pointer' : ''} fill-${color} text-${textColor} stroke-1`}
          />
        );
      }

      // Half star
      if (index === whole && showHalfStar) {
        return (
          <div className="relative">
            <StarHalf
              className={`h-${starSize} w-${starSize} ${!readonly ? 'cursor-pointer' : ''} fill-${color} text-${textColor} stroke-1`}
            />
            <Star
              className={`h-${starSize} w-${starSize} ${!readonly ? 'cursor-pointer' : ''} fill-none text-${textColor} absolute top-0 left-0 stroke-1`}
            />
          </div>
        );
      }

      // Empty star
      return (
        <Star
          className={`h-${starSize} w-${starSize} ${!readonly ? 'cursor-pointer' : ''} fill-none text-${textColor} stroke-1`}
        />
      );
    };
    return (
      <div ref={ref} className={cn("flex", className)} {...props}>
        {[...Array(max)].map((_, index) => (
          <div
            key={index}
            className={`${
              fullWidth ? "flex-1" : ""
            } flex flex-col items-center p-${padding}`}
          >
            {getStar(index)}
          </div>
        ))}
      </div>
    );
  }
);
Rate.displayName = "Rate";

export { Rate };
