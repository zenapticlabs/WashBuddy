import { useState } from "react";
import { Progress } from "../ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
interface PriceRangeProps {
  value?: number;
  minValue?: number;
  maxValue?: number;
  onChange?: (option: number) => void;
}

const PriceRange: React.FC<PriceRangeProps> = ({
  value,
  minValue = 0,
  maxValue = 35,
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
    <Accordion
      type="single"
      collapsible
      className="w-full px-2"
      defaultValue="item-1"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <div className="flex items-center text-body-2 text-[#262626]">
            <span className="text-title-1">Price range: </span>
            <span className="text-body-1">${value || progressValue}</span>
          </div>
        </AccordionTrigger>

        <AccordionContent>
          <Progress
            value={value || progressValue}
            minValue={minValue}
            maxValue={maxValue}
            onValueChange={handleChange}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default PriceRange;
