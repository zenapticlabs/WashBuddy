"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectRateProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: number;
  max?: number;
  readonly?: boolean;
  onChange?: (value: number) => void;
  title: string;
}

const SelectRate = React.forwardRef<HTMLDivElement, SelectRateProps>(
  (
    {
      value = 0,
      max = 5,
      readonly = false,
      onChange,
      className,
      title,
      ...props
    },
    ref
  ) => {
    const [hoverValue, setHoverValue] = React.useState<number | null>(null);

    const handleMouseMove = (index: number) => {
      if (!readonly) {
        setHoverValue(index + 1);
      }
    };

    const handleMouseLeave = () => {
      setHoverValue(null);
    };

    const handleClick = (index: number) => {
      if (!readonly && onChange) {
        onChange(index + 1);
      }
    };

    const displayValue = hoverValue ?? value;

    return (
      <div className={cn("w-full justify-between", className)}>
        <p className="text-title-3 font-figtree text-neutral-900 mb-4">{title}</p>
        <div
          ref={ref}
          className={cn("flex gap-1", className)}
          onMouseLeave={handleMouseLeave}
          {...props}
        >
          {[...Array(max)].map((_, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <Star
                className={cn(
                  "h-7 w-7 cursor-pointer",
                  index < displayValue
                    ? "fill-default-yellow text-default-yellow"
                    : "fill-none text-default-yellow",
                  readonly && "cursor-default"
                )}
                onMouseMove={() => handleMouseMove(index)}
                onClick={() => handleClick(index)}
              />
              {index === 0 && (
                <span className="text-body-3 mt-3 text-center text-neutral-900">Unaccptable</span>
              )}
              {index === 4 && (
                <span className="text-body-3 mt-3 text-center text-neutral-900">Excellent</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
);
SelectRate.displayName = "SelectRate";

export { SelectRate };
