import Image from "next/image";
import logo from "@/assets/logo.png";
import { Bell, MapPin, MenuIcon, Plus } from "lucide-react";
import { Button } from "../../ui/button";
import { useState } from "react";
import { Car_Wash_Type } from "@/utils/constants";
import user from "@/assets/user.png";
import AutomaticIcon from "@/assets/icons/automatic.svg";
import SelfServiceIcon from "@/assets/icons/self-service.svg";

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

const Topbar: React.FC = ({}) => {
  const notiCount = 2;
  const [carWashType, setCarWashType] = useState<string>(
    Car_Wash_Type.AUTOMATIC
  );

  return (
    <div className="flex gap-2 py-4 items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-full cursor-pointer" onClick={() => {}}>
          <MenuIcon size={24} className="text-neutral-900" />
        </div>
        <Image src={logo} alt="logo" width={42} height={42} color="#ff0000" />
        <span className="text-headline-4 font-bold pl-1">WashBuddy</span>
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
            <Image
              src={config.icon}
              alt={config.label}
              width={24}
              height={24}
            />
            <span className="text-title-2 text-neutral-900">
              {config.label}
            </span>
          </Button>
        ))}
        <span className="text-title-2 text-neutral-700 flex items-center gap-2">
          <MapPin size={24} />
          Downtown, NY
        </span>
      </div>
      <div className="flex items-center gap-6 pr-2">
        <Button
          variant="ghost"
          className="rounded-full shadow-none text-title-2 text-blue-500 hover:text-blue-500"
          onClick={() => {}}
        >
          <Plus size={24} />
          Add a WashNearby
        </Button>
        <div className="relative">
          <Bell size={24} className="text-neutral-900" />
          {notiCount > 0 && (
            <span className="bg-[#FF6464] border border-white text-title-2 text-white absolute -top-2 -right-1.5 rounded-full w-5 h-5 flex items-center justify-center z-10">
              {notiCount}
            </span>
          )}
        </div>
        <Image
          src={user}
          alt="user"
          width={32}
          height={32}
          className="rounded-full"
        />
      </div>
    </div>
  );
};

export default Topbar;
