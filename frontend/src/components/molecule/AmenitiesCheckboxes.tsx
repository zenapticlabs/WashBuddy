import { CarServiceAmenity } from "@/types";
import { useState } from "react";
import { Checkbox } from "../ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CircleBadge } from "../ui/circleBadge";

interface AmenitiesCheckboxesProps {
  value?: string[];
  onChange?: (option: string[]) => void;
  options?: CarServiceAmenity[];
}

const AmenitiesCheckboxes: React.FC<AmenitiesCheckboxesProps> = ({
  value,
  onChange,
  options,
}) => {
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const handleChange = (amenityId: string) => {
    if (onChange) {
      onChange(
        value?.includes(amenityId)
          ? value?.filter((id) => id !== amenityId)
          : [...(value || []), amenityId]
      );
    } else {
      setSelectedAmenities((prev) =>
        prev.includes(amenityId)
          ? prev.filter((id) => id !== amenityId)
          : [...prev, amenityId]
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
            <span className="text-title-1">Amenities</span>
            <CircleBadge
              text={
                value?.length?.toString() || selectedAmenities.length.toString()
              }
            />
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-4">
            {options?.map((amenity) => (
              <Checkbox
                key={amenity.id}
                label={amenity.service_name}
                checked={
                  value
                    ? value.includes(amenity.id)
                    : selectedAmenities.includes(amenity.id)
                }
                onChange={() => handleChange(amenity.id)}
                description={amenity.description}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default AmenitiesCheckboxes;
