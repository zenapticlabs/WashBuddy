import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

interface CheckTagProps {
  label: string;
  checked?: boolean;
}

export function CheckTag({ label, checked = false }: CheckTagProps) {
  return (
    <span
      className={cn(
        "h-7 px-3 rounded-full inline-flex gap-2 items-center justify-center text-neutral-800 text-body-2 cursor-pointer",
        checked ? "bg-neutral-100" : "bg-neutral-50"
      )}
    >
      {checked && <CheckIcon className="w-4 h-4" />}
      {label}
    </span>
  );
}
 