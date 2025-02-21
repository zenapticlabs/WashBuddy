import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

export interface CarWashPackagesProps {}

const CarWashPackages: React.FC<CarWashPackagesProps> = ({}) => {
  return (
    <div className="p-3 border border-neutral-100 rounded-xl">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <div className="bg-accent-yellow w-6 h-6 rounded-full flex items-center justify-center">
            <Star className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-body-2 text-neutral-900">+ 25 Points</span>
            <span className="w-4 h-4 border text-xs border-neutral-200 text-neutral-200 rounded-full flex items-center justify-center">
              i
            </span>
          </div>
        </div>
        <Button className="w-fit h-10">Update Info</Button>
      </div>
      <div className="text-body-3 text-neutral-500 pt-2">
        Wrong price? New photos? Upload a photo – earn points towards a free car
        wash! 🚗✨
      </div>
    </div>
  );
};

export default CarWashPackages;
