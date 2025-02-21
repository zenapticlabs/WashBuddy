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

interface AmenitiesCheckboxesProps {
  value: string[];
  onChange: (option: string[]) => void;
}

const AmenitiesCheckboxes: React.FC<AmenitiesCheckboxesProps> = ({
  value,
  onChange,
}) => {
  const [amenityOptions, setAmenityOptions] = useState<CarServiceAmenity[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAmenities = async () => {
    try {
      const response = await fetch("/api/car-services/amenities");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAmenityOptions(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch amenities"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAmenities();
  }, []);

  const handleChange = (amenityId: string) => {
    onChange
      ? onChange(
          value.includes(amenityId)
            ? value.filter((id) => id !== amenityId)
            : [...value, amenityId]
        )
      : setSelectedAmenities((prev) =>
          prev.includes(amenityId)
            ? prev.filter((id) => id !== amenityId)
            : [...prev, amenityId]
        );
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

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
            <CircleBadge text={value.length.toString()} />
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-4">
            {amenityOptions.map((amenity) => (
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
