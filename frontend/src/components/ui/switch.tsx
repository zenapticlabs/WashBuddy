"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
    label?: string;
    labelPosition?: 'start' | 'end';
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
  }
>(({ className, label, labelPosition = 'end', checked, onCheckedChange, ...props }, ref) => (
  <div className="flex items-center gap-2">
    {label && labelPosition === 'start' && (
      <label className="text-sm text-gray-700 font-figtree">{label}</label>
    )}
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-default-blue data-[state=unchecked]:bg-gray-400",
        className
      )}
      {...props}
      ref={ref}
      checked={checked}
      onCheckedChange={onCheckedChange}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitives.Root>
    {label && labelPosition === 'end' && (
      <label className="text-sm text-gray-700 font-figtree">{label}</label>
    )}
  </div>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
