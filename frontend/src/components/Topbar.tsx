import Image from "next/image";
import logo from "@/assets/logo.png";
import { Bell, MapPin, MenuIcon, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import UserComponent from "./molecule/Topbar/UserComponent";
import Notifications from "./molecule/Topbar/Notifications";
import AddWashNearbyBtn from "./molecule/Topbar/AddWashNeabyBtn";
import FilterWashType from "./molecule/Topbar/FilterWashType";
import { Car_Wash_Type } from "@/utils/constants";
import MyLocation from "./molecule/Topbar/MyLocation";
import MenuButton from "./molecule/Topbar/MenuButton";

export interface TopbarProps {}

const Topbar: React.FC<TopbarProps> = ({}) => {
  const [notifications, setNotifications] = useState<number>(2);
  const [carWashType, setCarWashType] = useState<string>(
    Car_Wash_Type.AUTOMATIC
  );
  return (
    <div className="flex gap-2 py-4 items-center justify-between">
      <div className="flex items-center gap-2">
        <MenuButton />
        <Image src={logo} alt="logo" width={42} height={42} color="#ff0000" />
        <span className="text-headline-4 font-bold pl-1">WashBuddy</span>
        <FilterWashType
          carWashType={carWashType}
          setCarWashType={setCarWashType}
        />
        <MyLocation />
      </div>
      <div className="flex items-center gap-6 pr-2">
        <AddWashNearbyBtn onClick={() => {}} />
        <Notifications count={2} />
        <UserComponent />
      </div>
    </div>
  );
};

export default Topbar;
