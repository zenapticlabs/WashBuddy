import { ScrollArea } from "@/components/ui/scroll-area";
import { CarWashCard } from "@/components/organism/carWashCard";
import { ICarWashCard } from "@/types";

interface MobileCarWashViewProps {
  showMap: boolean;
  carWashes: ICarWashCard[];
  selectedCarWash: ICarWashCard | null;
  onCarWashSelect: (carWash: ICarWashCard) => void;
}

export function MobileCarWashView({
  showMap,
  carWashes,
  onCarWashSelect,
}: MobileCarWashViewProps) {
  return (
    <div
      className={`block md:hidden absolute bottom-0 left-0 right-0 w-full bg-white transition-all duration-300 ease-in-out ${
        showMap ? "h-[200px] rounded-t-2xl" : "h-full"
      } px-5`}
    >
      {showMap && (
        <div className="w-20 h-1 bg-neutral-50 rounded-full mx-auto mt-4"></div>
      )}
      <div className="text-body-2 text-neutral-900 py-2">
        Showing {carWashes.length} results
      </div>
      <ScrollArea className="w-full h-full">
        <div className="flex flex-col gap-2">
          {carWashes.map((carWash) => (
            <CarWashCard
              key={carWash.id}
              data={carWash}
              onClick={() => onCarWashSelect(carWash)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
} 