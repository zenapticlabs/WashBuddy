import { CarServiceAmenity } from "@/types";
import { useState } from "react";
import { useEffect } from "react";
import { Checkbox } from "../ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CircleBadge } from "../ui/circleBadge";

interface OperatingHoursProps {
  value: string[];
  onChange: (option: string[]) => void;
}

const OperatingHours: React.FC<OperatingHoursProps> = ({ value, onChange }) => {
  const options: any = [{ id: "1", value: "open_now", label: "Open now" }];

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleChange = (optionId: string) => {
    onChange
      ? onChange(
          value.includes(optionId)
            ? value.filter((id) => id !== optionId)
            : [...value, optionId]
        )
      : setSelectedOptions((prev) =>
          prev.includes(optionId)
            ? prev.filter((id) => id !== optionId)
            : [...prev, optionId]
        );
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
            <span className="text-title-1">Operating hours</span>
            <CircleBadge
              text={
                value
                  ? value.length.toString()
                  : selectedOptions.length.toString()
              }
            />
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-4">
            {options.map((option: any) => (
              <Checkbox
                key={option.id}
                label={option.label}
                checked={
                  value
                    ? value.includes(option.id)
                    : selectedOptions.includes(option.id)
                }
                onChange={() => handleChange(option.id)}
                description={option.description}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default OperatingHours;
