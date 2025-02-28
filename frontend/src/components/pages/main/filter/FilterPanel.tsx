import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@radix-ui/react-separator";
import DistanceRange from "../../../molecule/DistanceRange";
import WashTypeCheckboxes from "../../../molecule/WashTypeCheckboxes";
import Ratings from "../../../molecule/RatingCheckboxes";
import PriceRange from "../../../molecule/PriceRange";
import OperatingHours from "../../../molecule/OperatingHoursCheckboxes";
import { Button } from "../../../ui/button";
import AmenitiesCheckboxes from "../../../molecule/AmenitiesCheckboxes";
import { FilterState } from "@/types/filters";
import { MockAmenities } from "@/mocks/amenities";
import { MockWashTypes } from "@/mocks/washTypes";
import { useEffect } from "react";
import { useState } from "react";
import { getAmenities } from "@/services/AmenityService";
import { Amenity, WashType } from "@/types";
import { getWashTypes } from "@/services/WashType";
import { Car_Wash_Type } from "@/utils/constants";

const initialFilterState: FilterState = {
  carWashType: Car_Wash_Type.AUTOMATIC,
  searchKey: "",
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
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [washTypes, setWashTypes] = useState<WashType[]>([]);

  useEffect(() => {
    const fetchAmenities = async () => {
      const amenities = await getAmenities();
      setAmenities(amenities);
    };
    fetchAmenities();
  }, []);

  useEffect(() => {
    const fetchWashTypes = async () => {
      const washTypes = await getWashTypes();
      setWashTypes(washTypes);
    };
    fetchWashTypes();
  }, []);

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
            options={MockAmenities}
          />
          <Separator />
          <WashTypeCheckboxes
            value={filters.washType}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, washType: value }))
            }
            options={MockWashTypes}
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
