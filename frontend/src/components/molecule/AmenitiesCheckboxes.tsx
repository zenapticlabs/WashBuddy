import { IAmenity } from "@/types";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CircleBadge } from "../ui/circleBadge";
import { CustomIconToggle } from "../ui/customIconToggle";
import { Amenities } from "@/utils/constants";
interface AmenitiesCheckboxesProps {
  value?: string[];
  onChange?: (option: string[]) => void;
  options?: IAmenity[];
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
          <div className="flex flex-row flex-wrap gap-2">
            {options?.map((amenity) => (
              <CustomIconToggle
                key={amenity.name}
                label={amenity.name}
                checked={value?.includes(amenity.name)}
                onChange={() => handleChange(amenity.name)}
                icon={Amenities.find((a) => a.name === amenity.name)?.icon }
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default AmenitiesCheckboxes;
