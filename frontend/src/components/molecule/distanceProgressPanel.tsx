import { cn } from "@/lib/utils";

interface DistanceProgressPanelProps {
}

export function DistanceProgressPanel({ text }: DistanceProgressPanelProps) {
  return (
    <div className="h-5 w-5 rounded-full flex items-center justify-center bg-default-blue text-white font-figtree font-medium text-sm">
      {text}
    </div>
  );
}
