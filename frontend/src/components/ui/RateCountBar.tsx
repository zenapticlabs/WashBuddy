interface RateCountBarProps {
  total: number;
  value: number;
  mark: number;
}

export function RateCountBar({ total, value, mark }: RateCountBarProps) {
  const widthPercent = (value / total) * 100;
  return (
    <div className={`flex items-center gap-2 min-w-[200px]`}>
      <div className="text-title-3 text-neutral-900">{mark}</div>
      <div className="w-full h-1 bg-neutral-200 rounded-full">
        <div
          className="h-full bg-accent-yellow rounded-full"
          style={{ width: `${widthPercent}%` }}
        />
      </div>
      <div className="text-body-3 text-neutral-500">({value})</div>
    </div>
  );
}
