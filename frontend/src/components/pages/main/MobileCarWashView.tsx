import { ScrollArea } from "@/components/ui/scroll-area";
import { CarWashCard } from "@/components/organism/carWashCard";
import { FilterState } from "@/types";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { SortBy, Car_Wash_Type } from "@/utils/constants";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { CarWashResponse } from "@/types/CarServices";
interface MobileCarWashViewProps {
  showMap: boolean;
  carWashes: CarWashResponse[];
  selectedCarWash: CarWashResponse | null;
  onCarWashSelect: (carWash: CarWashResponse) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

export function MobileCarWashView({
  showMap,
  carWashes,
  onCarWashSelect,
  filters,
  setFilters,
}: MobileCarWashViewProps) {
  const [openSortBy, setOpenSortBy] = useState(false);
  return (
    <div
      className={`block md:hidden absolute bottom-0 left-0 right-0 w-full bg-white transition-all duration-300 ease-in-out ${showMap ? "h-[200px] rounded-t-2xl" : "h-full"
        } px-5`}
    >
      {showMap && (
        <div className="w-20 h-1 bg-neutral-50 rounded-full mx-auto mt-4"></div>
      )}
      <div className="text-body-2 text-neutral-900 py-2">
        <div className="py-2">Showing {carWashes.length} results</div>
        <Button variant="outline" className="rounded-full border border-neutral-50" onClick={() => setOpenSortBy(true)}>
          {filters.sortBy}
          <ChevronDown className="text-neutral-500" />
        </Button>
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
      <Sheet open={openSortBy} onOpenChange={setOpenSortBy}>
        <SheetContent side='bottom' className="pt-2 pb-4 px-8 rounded-t-lg">
          <SheetHeader className="py-3 text-left text-title-1">
            <SheetTitle>
              Sort by
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-6">
            {SortBy[filters.automaticCarWash ? Car_Wash_Type.AUTOMATIC : Car_Wash_Type.SELF_SERVICE].map((sort) => (
              <button
                key={sort.value}
                className={cn(
                  "rounded-full bg-white text-left text-title-2",
                  filters.sortBy.includes(sort.value) ? "text-blue-500" : "text-neutral-900"
                )}
                onClick={() => {
                  setFilters({ ...filters, sortBy: [sort.value] });
                  setOpenSortBy(false);
                }}
              >
                {sort.label}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
} 