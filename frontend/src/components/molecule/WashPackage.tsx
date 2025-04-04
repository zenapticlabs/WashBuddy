import { CarWashPackage } from "@/types/CarServices";
import { WashTypes } from "@/utils/constants";
import Image from "next/image";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "../ui/separator";

interface WashPackageProps {
  data: CarWashPackage;
}

const washTypesBySubclass = WashTypes.reduce((acc, washType) => {
  const subclass = washType.subclass;
  if (!acc[subclass]) {
    acc[subclass] = [];
  }
  acc[subclass].push(washType);
  return acc;
}, {} as Record<string, typeof WashTypes>);

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
          {/* <div className="text-body-2 text-neutral-500">{data.description}</div> */}
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-80">
        <div className="text-title-2 text-neutral-900 mb-4">Wash Types</div>
        <div className="flex flex-col gap-4">
          {Object.entries(washTypesBySubclass).map(([subclass, types]) => (
            <div key={subclass} className="flex flex-col gap-2">
              <div className="text-body-2 font-semibold text-neutral-900">
                {subclass}
              </div>
              <div className="flex gap-2 flex-wrap">
                {types.map((washType) => (
                  <div
                    key={washType.id}
                    className="flex flex-col items-center gap-1"
                  >
                    <Image
                      src={washType.icon}
                      alt={washType.name}
                      width={24}
                      height={24}
                      className={`${
                        data.wash_types
                          .map((type: any) => type.id)
                          .includes(Number(washType.id))
                          ? "text-blue-500 opacity-100"
                          : "text-gray-300 opacity-30"
                      }`}
                    />
                    <span className="text-xs text-neutral-600 text-center max-w-[80px] line-clamp-2">
                      {washType.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default WashPackage;
