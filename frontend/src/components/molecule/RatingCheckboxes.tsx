import { useState } from "react";
import { Checkbox } from "../ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CircleBadge } from "../ui/circleBadge";
import { Star } from "lucide-react";

interface RatingCheckboxesProps {
  value?: number[];
  onChange?: (option: number[]) => void;
}

const RatingCheckboxes: React.FC<RatingCheckboxesProps> = ({
  value,
  onChange,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

  const handleChange = (optionId: number) => {
    if (onChange) {
      const newValue = value?.includes(optionId)
        ? value?.filter((id) => id !== optionId)
        : [...(value || []), optionId];
      onChange(newValue);
    } else {
      setSelectedOptions((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      );
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
          <div className="flex items-center gap-2">
            <span className="text-title-1">Ratings</span>
            <CircleBadge
              text={
                value?.length?.toString() || selectedOptions.length.toString()
              }
            />
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-4">
            {Array.from({ length: 5 }, (_, index) => (
              <Checkbox
                key={index}
                label={
                  <span className="flex items-center gap-2">
                    {index + 1}
                    <Star className="w-4 h-4 text-yellow-500 fill-default-yellow" />
                  </span>
                }
                checked={
                  value
                    ? value.includes(index + 1)
                    : selectedOptions.includes(index + 1)
                }
                onChange={() => handleChange(index + 1)}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default RatingCheckboxes;
