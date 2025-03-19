"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { TooltipContent } from "./tooltip";
import { Tooltip, TooltipProvider } from "./tooltip";
import { TooltipTrigger } from "./tooltip";
import { Button } from "./button";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    label?: React.ReactNode;
    position?: "left" | "right";
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    description?: string;
  }
>(
  (
    {
      className,
      label,
      position = "right",
      checked,
      onChange,
      description,
      ...props
    },
    ref
  ) => (
    <div
      className={cn(
        "flex items-center gap-2",
        position === "left" && "flex-row-reverse"
      )}
    >
      <div className="flex items-center gap-2" onClick={() => onChange?.(!checked)}>
        <CheckboxPrimitive.Root
          ref={ref}
          className={cn(
            "peer h-4 w-4 shrink-0 rounded-sm border border-gray-400 shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-default-blue data-[state=checked]:text-primary-foreground data-[state=checked]:border-default-blue",
            className
          )}
          {...props}
          checked={checked}
        >
          <CheckboxPrimitive.Indicator
            className={cn("flex items-center justify-center text-current")}
          >
            <Check className="h-4 w-4" />
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        {label && (
          <span
            className={cn(
              "text-sm text-gray-700 cursor-pointer font-figtree",
              className
            )}
          >
            {label}
          </span>
        )}
      </div>
      {description && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="w-3 h-3 rounded-full px-1 py-0.5 text-[8px] text-gray-400 font-semibold flex items-center justify-center cursor-pointer"
              >
                i
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" align="center">
              {description}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
