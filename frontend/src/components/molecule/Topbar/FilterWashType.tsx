import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AutomaticIcon from "@/assets/icons/automatic.svg";
import SelfServiceIcon from "@/assets/icons/self-service.svg";
import { useState } from "react";
import Image from "next/image";
import { Car_Wash_Type } from "@/utils/constants";

interface FilterWashTypeProps {
  carWashType: string;
  setCarWashType: (filter: string) => void;
}

const FilterButtonConfigs = [
  {
    icon: AutomaticIcon,
    key: Car_Wash_Type.AUTOMATIC,
    label: Car_Wash_Type.AUTOMATIC,
  },
  {
    icon: SelfServiceIcon,
    key: Car_Wash_Type.SELF_SERVICE,
    label: Car_Wash_Type.SELF_SERVICE,
  },
];

const FilterWashType: React.FC<FilterWashTypeProps> = ({
  carWashType,
  setCarWashType,
}) => {
  return (
    <>
      {FilterButtonConfigs.map((config) => (
        <Button
          variant="outline"
          key={config.key}
          onClick={() => setCarWashType(config.key)}
          className={`rounded-full shadow-none ${
            carWashType === config.key
              ? "border-blue-500"
              : "border-neutral-100"
          }`}
        >
          <Image src={config.icon} alt={config.label} width={24} height={24} />
          <span className="text-title-2 text-neutral-900">{config.label}</span>
        </Button>
      ))}
    </>
  );
};

export default FilterWashType;
