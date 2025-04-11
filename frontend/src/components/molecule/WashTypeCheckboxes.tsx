import { CarServiceWashType } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CircleBadge } from "../ui/circleBadge";
import { CustomIconToggle } from "../ui/customIconToggle";
import Image from "next/image";

interface WashTypeCheckboxesProps {
  value?: string[];
  onChange?: (option: string[]) => void;
  options?: CarServiceWashType[];
}

interface WashTypeOption {
  detailed_type: string;
  services: CarServiceWashType[];
}

const transformServicesToGroups = (
  services: CarServiceWashType[]
): WashTypeOption[] => {
  return services?.reduce((acc: WashTypeOption[], service) => {
    const existingGroup = acc.find(
      (group) => group.detailed_type === service.subclass
    );

    if (existingGroup) {
      existingGroup.services.push(service);
    } else {
      acc.push({
        detailed_type: service.subclass || "",
        services: [service],
      });
    }

    return acc;
  }, []);
};

const WashTypeCheckboxes: React.FC<WashTypeCheckboxesProps> = ({
  value,
  onChange,
  options,
}) => {
  const [selectedWashTypes, setSelectedWashTypes] = useState<string[]>([]);
  const handleChange = (option: string) => {
    if (onChange) {
      const newValue = value?.includes(option)
        ? value?.filter((v) => v !== option)
        : [...(value || []), option];
      onChange(newValue);
    } else {
      setSelectedWashTypes((prev) =>
        prev.includes(option)
          ? prev.filter((v) => v !== option)
          : [...prev, option]
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
            <span className="text-title-1">Wash Type</span>
            <CircleBadge
              text={
                value?.length?.toString() || selectedWashTypes.length.toString()
              }
            />
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {transformServicesToGroups(options || [])?.map((option) => (
            <div key={option.detailed_type} className="py-1">
              <legend className="text-title-2 py-2 text-neutral-900">
                {option.detailed_type}
              </legend>
              <div className="flex flex-row flex-wrap gap-2">
                {option.services?.map((service) => (
                  <CustomIconToggle
                    key={service.name}
                    label={service.name}
                    checked={value?.includes(service.name)}
                    onChange={() => handleChange(service.name)}
                    icon={service.icon}
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
