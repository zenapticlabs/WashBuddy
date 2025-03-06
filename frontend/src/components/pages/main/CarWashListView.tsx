import { ScrollArea } from "@/components/ui/scroll-area";
import { CarWashCard } from "@/components/organism/carWashCard";
import CarWashDetail from "@/components/pages/main/about/CarWashDetail";
import { ICarWashCard } from "@/types";

interface CarWashListViewProps {
  carWashes: ICarWashCard[];
  selectedCarWash: ICarWashCard | null;
  openAbout: boolean;
  setOpenAbout: (open: boolean) => void;
  onCarWashSelect: (carWash: ICarWashCard) => void;
  onNavigate: (location: { lat: number; lng: number }) => void;
}

export function CarWashListView({
  carWashes,
  selectedCarWash,
  openAbout,
  setOpenAbout,
  onCarWashSelect,
  onNavigate,
}: CarWashListViewProps) {
  return (
    <div className="w-[550px] relative bg-white hidden md:block">
      <ScrollArea className="w-full h-full">
        <div className="flex flex-col gap-2 pr-4">
          {carWashes.map((carWash) => (
            <CarWashCard
              key={carWash.id}
              data={carWash}
              onClick={() => onCarWashSelect(carWash)}
            />
          ))}
        </div>
      </ScrollArea>
      <CarWashDetail
        data={selectedCarWash}
        open={openAbout}
        setOpen={setOpenAbout}
        onNavigate={onNavigate}
      />
    </div>
  );
} 