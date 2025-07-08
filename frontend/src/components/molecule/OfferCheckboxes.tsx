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
    { id: "1", value: "offer", label: "Offer" },
  ];

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleChange = (optionId: string) => {
    if (onChange) {
      onChange(
        value?.includes(optionId)
          ? value?.filter((id) => id !== optionId)
          : [...(value || []), optionId]
      );
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
