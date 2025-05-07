import { MenuIcon } from "lucide-react";
import Image from "next/image";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import AutomaticIcon from "@/assets/icons/automatic.svg";
import SelfServiceIcon from "@/assets/icons/self-service.svg";
import { Car_Wash_Type, SortBy } from "@/utils/constants";
import { Bell, MapPin, Plus } from "lucide-react";
import { FilterState } from "@/types/filters";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
const defaultAvatar =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde";

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
  locationData?: any;
}

const Topbar: React.FC<TopbarProps> = ({
  filters,
  setFilters,
  sideBarAlwaysOpen,
  locationData,
}) => {
  const { toast } = useToast()
  const { signOut, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const notiCount = 2
  // const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(false);

  const handleNavigateCreatePage = () => {
    if (!user) {
      toast({
        title: "Please login to add your local carwash",
        description: "Login to add your local carwash and earn 25 points",
        variant: "destructive",
        action: <Button variant="destructive" className="border border-white" onClick={() => router.push("/login")}>Login</Button>
      })
      return;
    }
    if (filters) {
      sessionStorage.setItem('dashboardFilters', JSON.stringify(filters));
    }
    router.push("/carwash");

  };

  const handleSelectCarWashType = (value: boolean) => {
    if (pathname !== "/") {
      // If not on dashboard, navigate to dashboard with filter params
      const params = new URLSearchParams();
      params.append("automaticCarWash", value.toString());
      params.append("selfServiceCarWash", (!value).toString());
      params.append(
        "sortBy",
        SortBy[value ? Car_Wash_Type.AUTOMATIC : Car_Wash_Type.SELF_SERVICE][0]
          .value
      );
      router.push(`/?${params.toString()}`);
    } else if (filters && setFilters) {
      // If on dashboard, update filters directly
      setFilters({
        ...filters,
        automaticCarWash: value,
        selfServiceCarWash: !value,
        page: 1,
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
    <div className="bg-white">
      <Toaster />
      <div
        className={`flex gap-2 items-center justify-between px-4 h-[66px] ${sideBarAlwaysOpen || openSidebar ? "border-b border-neutral-100" : ""
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
                className={`rounded-full shadow-none ${filters?.automaticCarWash === config.value
                  ? "border-blue-500"
                  : "border-neutral-100"
                  }`}
              >
                <Image
                  src={config.icon}
                  alt={config.label}
                  width={24}
                  height={24}
                  className={`${filters?.automaticCarWash === config.value ? "filter-blue-500" : ""}`}
                />
                <span className="text-title-2 text-neutral-900">
                  {config.label}
                </span>
              </Button>
            ))}
            <span className="text-title-2 text-neutral-700 flex items-center gap-2">
              <MapPin size={24} />
              {locationData && `${locationData?.city}, ${locationData?.state}`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 pr-2">
          <Plus
            size={24}
            className="block md:hidden text-blue-500"
            onClick={handleNavigateCreatePage}
          />
          <Button
            variant="ghost"
            className="rounded-full shadow-none text-title-2 text-blue-500 hover:text-blue-500 hidden md:block mr-4"
            onClick={handleNavigateCreatePage}
          >
            + Add your local carwash
          </Button>
          {
            user && (
              <>
                <div className="relative">
                  <Bell size={24} className="text-neutral-900" />
                  {notiCount > 0 && (
                    <span className="bg-[#FF6464] border border-white text-title-2 text-white absolute -top-2 -right-1.5 rounded-full w-5 h-5 flex items-center justify-center z-10">
                      {notiCount}
                    </span>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2">
                    {
                      user?.user_metadata?.avatar_url ? (
                        <Image
                          src={user?.user_metadata?.avatar_url || defaultAvatar}
                          alt={`${user?.user_metadata?.firstName}'s avatar`}
                          className="w-10 h-10 rounded-full"
                          width={40}
                          height={40}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-green-700 text-white flex items-center justify-center">
                          {user?.user_metadata?.firstName?.charAt(0).toUpperCase()}
                        </div>
                      )
                    }
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )
          }
          {
            !user && (
              <div className="flex items-center gap-2">
                <Button onClick={() => router.push("/login")} variant="outline" className="rounded-full shadow-none text-title-2 text-blue-500 border-blue-500 hover:text-blue-500 hidden md:block">
                  Log in
                </Button>
                <Button onClick={() => router.push("/signup")} variant="default" className="rounded-full shadow-none text-title-2 text-white hover:text-white hidden md:block mr-4">
                  Sign up
                </Button>
              </div>
            )
          }
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
