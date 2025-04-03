import * as React from "react";
import { cn } from "@/lib/utils";

interface IconToggleProps {
  label: string;
  icon: React.ReactNode;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

const IconToggle = React.forwardRef<HTMLDivElement, IconToggleProps>(
  ({ label, icon, checked = false, onChange, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-full cursor-pointer transition-all w-fit border",
          checked ? "border-blue-500" : "border-neutral-300",
          className
        )}
        onClick={() => onChange?.(!checked)}
      >
        <div
          className={cn(
            "flex text-white items-center justify-center transition-colors rounded-full p-1 border",
            checked ? "bg-blue-500 border-blue-500" : "bg-white border-neutral-300"
          )}
        >
          {icon}
        </div>
        <span
          className={cn(
            "text-sm font-medium transition-colors",
            checked ? "text-blue-500" : "text-neutral-300"
          )}
        >
          {label}
        </span>
      </div>
    );
  }
);

IconToggle.displayName = "IconToggle";

export { IconToggle };
