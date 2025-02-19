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
import { Star } from "lucide-react";

interface RatingsProps {
  value: number[];
  onChange: (option: number[]) => void;
}

const Ratings: React.FC<RatingsProps> = ({ value, onChange }) => {
  const options: any = [
    { id: "1", value: 1, label: "1" },
    { id: "2", value: 2, label: "2" },
    { id: "3", value: 3, label: "3" },
    { id: "4", value: 4, label: "4" },
    { id: "5", value: 5, label: "5" },
  ];

  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

  const handleChange = (optionId: number) => {
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
            <span className="text-title-1">Ratings</span>
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
                label={
                  <span className="flex items-center gap-2">
                    {option.label}
                    <Star className="w-4 h-4 text-yellow-500 fill-default-yellow" />
                  </span>
                }
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

export default Ratings;
