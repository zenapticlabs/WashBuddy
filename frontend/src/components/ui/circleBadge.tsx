import { cn } from "@/lib/utils";

interface CircleBadgeProps {
  text: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
}

export function CircleBadge({ text }: CircleBadgeProps) {
  return (
    <div className="h-5 w-5 rounded-full flex items-center justify-center bg-default-blue text-white font-figtree font-medium text-sm">
      {text}
    </div>
  );
}
