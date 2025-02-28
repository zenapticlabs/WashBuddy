import { useState } from "react";
import { Progress } from "../ui/progress";

interface DistanceRangeProps {
  value?: number;
  minValue?: number;
  maxValue?: number;
  onChange?: (option: number) => void;
}

const DistanceRange: React.FC<DistanceRangeProps> = ({
  value,
  minValue = 0,
  maxValue = 100,
  onChange,
}) => {
  const [progressValue, setProgressValue] = useState(0);
  const handleChange = (value: number) => {
    if (onChange) {
      onChange(value);
    } else {
      setProgressValue(value);
    }
  };
  return (
    <div className="w-full flex flex-col gap-4 pb-4">
      <div className="flex items-center px-2 text-body-2 text-[#262626]">
        <span className="text-title-1">Distance: </span>
        <span className="text-body-1">{value || progressValue} miles</span>
      </div>
      <Progress
        value={value || progressValue}
        minValue={minValue}
        maxValue={maxValue}
        onValueChange={handleChange}
      />
    </div>
  );
};

export default DistanceRange;
