import { MenuIcon } from "lucide-react";
import Image from "next/image";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import AutomaticIcon from "@/assets/icons/automatic.svg";
import SelfServiceIcon from "@/assets/icons/self-service.svg";
import { Car_Wash_Type } from "@/utils/constants";
import user from "@/assets/user.png";
import { Bell, MapPin, Plus } from "lucide-react";
import { FilterState } from "@/types/filters";
import { useState } from "react";
import CreateCarWashDiaolog from "./CreateCarWashDiaolog";
import Sidebar from "./Sidebar";
import Link from "next/link";

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

interface TopbarProps {
  filters?: FilterState;
  setFilters?: (filters: FilterState) => void;
  sideBarAlwaysOpen?: boolean;
}

const Topbar: React.FC<TopbarProps> = ({ filters, setFilters, sideBarAlwaysOpen }) => {
  const [notiCount, setNotiCount] = useState(2);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(false);
  const handleOpenCreateModal = () => setOpenCreateModal(true);

  return (
    <div>
      <div className={`flex gap-2 items-center justify-between px-4 h-[66px] ${sideBarAlwaysOpen || openSidebar ? 'border-b border-neutral-100' : ''}`}>
        <div className="flex items-center gap-2">
          <div
            className="p-2 rounded-full cursor-pointer"
            onClick={() => setOpenSidebar(true)}
          >
            <MenuIcon size={24} className="text-neutral-900" />
          </div>
          <Link href="/" className="flex items-center gap-2">
            <Image src={logo} alt="logo" width={42} height={42} color="#ff0000" />
            <span className="hidden lg:block text-headline-4 font-bold pl-1">
              WashBuddy
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-2">
            {FilterButtonConfigs.map((config) => (
              <Button
                variant="outline"
                key={config.key}
                onClick={() =>
                  setFilters && filters && setFilters({ ...filters, carWashType: config.key })
                }
                className={`rounded-full shadow-none ${filters?.carWashType === config.key
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
        </div>
        <div className="flex items-center gap-3 pr-2">
          <Plus
            size={24}
            className="block md:hidden text-blue-500"
            onClick={handleOpenCreateModal}
          />
          <Button
            variant="ghost"
            className=" rounded-full shadow-none text-title-2 text-blue-500 hover:text-blue-500 hidden md:block"
            onClick={handleOpenCreateModal}
          >
            + Add a WashNearby
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
      <CreateCarWashDiaolog
        open={openCreateModal}
        onOpenChange={setOpenCreateModal}
      />
      <Sidebar open={openSidebar} onOpenChange={setOpenSidebar} sideBarAlwaysOpen={sideBarAlwaysOpen} />
    </div>
  );
};

export default Topbar;
