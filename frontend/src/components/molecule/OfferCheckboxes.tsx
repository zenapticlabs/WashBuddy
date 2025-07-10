import { useState } from "react";
import { Checkbox } from "../ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CircleBadge } from "../ui/circleBadge";

interface OfferCheckboxesProps {
  value?: string[];
  onChange?: (option: string[]) => void;
}

interface OperatingOption {
  id: string;
  value: string;
  label: string;
  description?: string;
}

const OfferCheckboxes: React.FC<OfferCheckboxesProps> = ({
  value,
  onChange,
}) => {
  const options: OperatingOption[] = [
    { id: "1", value: "offers", label: "WashBuddy Deals" },
    { id: "2", value: "active_bounty", label: "Bounty" },
  ];

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleChange = (optionId: string) => {
    if (onChange) {
      // If the option is already selected, deselect it
      if (value?.includes(optionId)) {
        onChange(value.filter((id) => id !== optionId));
      } else {
        // If selecting a new option, make it the only selected option
        onChange([optionId]);
      }
    } else {
      // Internal state management follows the same logic
      setSelectedOptions((prev) =>
        prev.includes(optionId) ? [] : [optionId]
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
            <span className="text-title-1">Special Offers</span>
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
            {options.map((option: OperatingOption) => (
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

export default OfferCheckboxes;
