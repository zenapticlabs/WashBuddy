import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@radix-ui/react-separator";
import DistanceRange from "./molecule/DistanceRange";
import WashTypeCheckboxes from "./molecule/WashTypeCheckboxes";
import Ratings from "./molecule/Ratings";
import PriceRange from "./molecule/PriceRange";
import OperatingHours from "./molecule/OperatingHours";
import { Button } from "./ui/button";
import AmenitiesCheckboxes from "./molecule/AmenitiesCheckboxes";
import { FilterState } from "@/types/filters";

const initialFilterState: FilterState = {
  distanceRange: 0,
  amenities: [],
  washType: [],
  ratings: [],
  priceRange: 0,
  operatingHours: [],
};

export interface FilterPanelProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  open,
  setOpen,
  filters,
  setFilters,
}) => {
  const handleReset = () => {
    setFilters(initialFilterState);
  };

  const handleApply = () => {
    setFilters(filters);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="left"
        className="h-screen p-0 rounded-r-xl flex flex-col"
      >
        <SheetHeader className="p-4">
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col px-2 overflow-y-auto h-full gap-4">
          <DistanceRange
            value={filters.distanceRange}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, distanceRange: value }))
            }
          />
          <Separator />
          <AmenitiesCheckboxes
            value={filters.amenities}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, amenities: value }))
            }
          />
          <Separator />
          <WashTypeCheckboxes
            value={filters.washType}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, washType: value }))
            }
          />
          <Separator />
          <Ratings
            value={filters.ratings}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, ratings: value }))
            }
          />
          <Separator />
          <PriceRange
            value={filters.priceRange}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, priceRange: value }))
            }
          />
          <Separator />
          <OperatingHours
            value={filters.operatingHours}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, operatingHours: value }))
            }
          />
        </div>
        <SheetFooter className="flex pb-2 px-2 gap-2">
          <Button variant="outline" className="flex-1" onClick={handleReset}>
            Reset
          </Button>
          <Button variant="default" className="flex-1" onClick={handleApply}>
            Apply
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default FilterPanel;
