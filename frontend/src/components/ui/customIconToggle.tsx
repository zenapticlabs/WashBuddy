import * as React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface CustomIconToggleProps {
  label: string;
  icon: React.ReactNode;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

const CustomIconToggle = React.forwardRef<HTMLDivElement, CustomIconToggleProps>(
  ({ label, icon, checked = false, onChange, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-full cursor-pointer transition-all w-fit border",
          checked ? "border-blue-500" : "border-neutral-100",
          className
        )}
        onClick={() => onChange?.(!checked)}
      >
        <div
          className={cn(
            "flex text-white items-center justify-center transition-colors rounded-full px-1 py-[1px]",
            checked ? "opacity-100" : "opacity-30"
          )}
        >
          {icon}
        </div>
        <span
          className={cn(
            "text-body-1 font-medium transition-colors",
            checked ? "text-blue-500" : "text-neutral-300"
          )}
        >
          {label}
        </span>
      </div>
    );
  }
);

CustomIconToggle.displayName = "CustomIconToggle";

export { CustomIconToggle };
