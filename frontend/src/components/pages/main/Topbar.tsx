import { MenuIcon } from "lucide-react";
import Image from "next/image";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import AutomaticIcon from "@/assets/icons/automatic.svg";
import SelfServiceIcon from "@/assets/icons/self-service.svg";
import { Car_Wash_Type, SortBy } from "@/utils/constants";
import user from "@/assets/user.png";
import { Bell, MapPin, Plus } from "lucide-react";
import { FilterState } from "@/types/filters";
import { useEffect, useState } from "react";
import CreateCarWashDiaolog from "./CreateCarWashDiaolog";
import Sidebar from "./Sidebar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import useLocationData from "@/hooks/useLocationData";

const FilterButtonConfigs = [
  {
    icon: AutomaticIcon,
    value: true,
    label: Car_Wash_Type.AUTOMATIC,
  },
  {
    icon: SelfServiceIcon,
    value: false,
    label: Car_Wash_Type.SELF_SERVICE,
  },
];

interface TopbarProps {
  filters?: FilterState;
  setFilters?: (filters: FilterState) => void;
  sideBarAlwaysOpen?: boolean;
}

const Topbar: React.FC<TopbarProps> = ({
  filters,
  setFilters,
  sideBarAlwaysOpen,
}) => {
  const { signOut } = useAuth();
  const { locationData, fetchLocationData, error, loading } = useLocationData();
  const router = useRouter();
  const [notiCount, setNotiCount] = useState(2);
  // const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(false);

  useEffect(() => {
    fetchLocationData();
  }, [fetchLocationData]);

  const handleOpenCreateModal = () => {
    // setOpenCreateModal(true);
    router.push("/carwash");
  };

  const handleSelectCarWashType = (value: boolean) => {
    if (filters && setFilters) {
      setFilters({
        ...filters,
        automaticCarWash: value,
        sortBy: [
          SortBy[
            value ? Car_Wash_Type.AUTOMATIC : Car_Wash_Type.SELF_SERVICE
          ][0].value,
        ],
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login"); // Redirect to login page after logout
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div>
      <div
        className={`flex gap-2 items-center justify-between px-4 h-[66px] ${
          sideBarAlwaysOpen || openSidebar ? "border-b border-neutral-100" : ""
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className="p-2 rounded-full cursor-pointer"
            onClick={() => setOpenSidebar(!openSidebar)}
          >
            <MenuIcon size={24} className="text-neutral-900" />
          </div>
          <Link href="/" className="flex items-center gap-2">
            <Image
              src={logo}
              alt="logo"
              width={42}
              height={42}
              color="#ff0000"
            />
            <span className="hidden lg:block text-headline-4 font-bold pl-1">
              WashBuddy
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-2">
            {FilterButtonConfigs.map((config) => (
              <Button
                variant="outline"
                key={config.label}
                onClick={() => handleSelectCarWashType(config.value)}
                className={`rounded-full shadow-none ${
                  filters?.automaticCarWash === config.value
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
              {loading && <div>Loading...</div>}
              {error && <div>Error: {error}</div>}
              {locationData && `${locationData?.city}, ${locationData?.state}`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 pr-2">
          <Plus
            size={24}
            className="block md:hidden text-blue-500"
            onClick={handleOpenCreateModal}
          />
          <Link
            className="rounded-full shadow-none text-title-2 text-blue-500 hover:text-blue-500 hidden md:block mr-4"
            href="/carwash"
          >
            + Add your local carwash
          </Link>
          <div className="relative">
            <Bell size={24} className="text-neutral-900" />
            {notiCount > 0 && (
              <span className="bg-[#FF6464] border border-white text-title-2 text-white absolute -top-2 -right-1.5 rounded-full w-5 h-5 flex items-center justify-center z-10">
                {notiCount}
              </span>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Image
                src={user}
                alt="user"
                width={32}
                height={32}
                className="rounded-full"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem onClick={handleLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* <CreateCarWashDiaolog
        open={openCreateModal}
        onOpenChange={setOpenCreateModal}
      /> */}
      <Sidebar
        open={openSidebar}
        onOpenChange={setOpenSidebar}
        sideBarAlwaysOpen={sideBarAlwaysOpen}
      />
    </div>
  );
};

export default Topbar;
