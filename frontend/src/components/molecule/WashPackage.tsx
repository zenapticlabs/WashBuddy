import { ICarServiceWashPackage } from "@/types/CarServices";

interface WashPackageProps {
  data: ICarServiceWashPackage;
}

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "../ui/separator";

const WashPackage: React.FC<WashPackageProps> = ({ data }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          key={data.id}
          className="border border-neutral-100 p-2 rounded-lg flex-shrink-0 max-w-[150px] cursor-pointer hover:border-accent-blue transition-all duration-300"
        >
          <div className="text-title-2 text-neutral-900">{data.name}</div>
          <div className="flex items-center gap-1 text-headline-5 my-1">
            <span className="text-neutral-900">${data.price}</span>
          </div>
          <div className="text-body-2 text-neutral-500">{data.description}</div>
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-80 flex flex-col gap-2">
        <div className="text-title-2 text-neutral-900">Wash Types</div>
        <div className="flex flex-col gap-2 pl-2">
          {data.wash_types.map((wt) => (
            <div key={wt.id} className="text-body-2 text-neutral-700">
              {wt.name}
            </div>
          ))}
          {data.wash_types.length === 0 && (
            <div className="text-body-2 text-neutral-500">
              No wash types available
            </div>
          )}
        </div>
        <Separator />
        <div className="text-title-2 text-neutral-900">Amenities</div>
        <div className="flex flex-col gap-2 pl-2">
          {data.amenities.map((amenity) => (
            <div key={amenity.id} className="text-body-2 text-neutral-700">
              {amenity.name}
            </div>
          ))}
          {data.amenities.length === 0 && (
            <div className="text-body-2 text-neutral-500">
              No amenities available
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default WashPackage;
