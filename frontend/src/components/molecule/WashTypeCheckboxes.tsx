import { CarServiceWashType } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CircleBadge } from "../ui/circleBadge";

interface WashTypeCheckboxesProps {
  value: string[];
  onChange: (option: string[]) => void;
}

interface WashTypeOption {
  detailed_type: string;
  services: CarServiceWashType[];
}

const transformServicesToGroups = (
  services: CarServiceWashType[]
): WashTypeOption[] => {
  return services
    .reduce((acc: WashTypeOption[], service) => {
      const existingGroup = acc.find(
        (group) => group.detailed_type === service.service_type
      );

      if (existingGroup) {
        existingGroup.services.push(service);
      } else {
        acc.push({
          detailed_type: service.service_type || "",
          services: [service],
        });
      }

      return acc;
    }, []);
};

const WashTypeCheckboxes: React.FC<WashTypeCheckboxesProps> = ({
  value,
  onChange,
}) => {
  const [options, setOptions] = useState<WashTypeOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/car-services/wash-types");
        if (!response.ok) {
          throw new Error("Failed to fetch services");
        }
        const data = await response.json();
        setOptions(transformServicesToGroups(data));
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleChange = (option: string) => {
    onChange(
      value.includes(option)
        ? value.filter((v) => v !== option)
        : [...value, option]
    );
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <Accordion type="single" collapsible className="w-full px-2" defaultValue="item-1">
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <div className="flex items-center gap-2">
            <span className="text-title-1">Wash Type</span>
            <CircleBadge text={value.length.toString()} />
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {options.map((option) => (
            <div key={option.detailed_type} className="py-1">
              <legend className="text-title-2 py-2 text-neutral-900">
                {option.detailed_type}
              </legend>
              <div className="flex flex-col gap-4">
                {option.services.map((service) => (
                  <Checkbox
                    key={service.id}
                    label={service.service_name}
                    checked={value.includes(service.id)}
                    onChange={() => handleChange(service.id)}
                    description={service.description}
                  />
                ))}
              </div>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default WashTypeCheckboxes;
