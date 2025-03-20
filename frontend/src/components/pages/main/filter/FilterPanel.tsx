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
import { useEffect, useState } from "react";
import { Amenity, CarServiceAmenity, CarServiceWashType, WashType } from "@/types";
import { getWashTypes } from "@/services/WashType";
import { Car_Wash_Type, Car_Wash_Type_Value, SortBy } from "@/utils/constants";
import useMediaQuery from "@/hooks/useMediaQuery";
import { getAmenities } from "@/services/AmenityService";

const initialFilterState: FilterState = {
  automaticCarWash: true,
  distance: 3,
  amenities: [],
  washType: [],
  ratings: [],
  priceRange: 0,
  operatingHours: [],
  sortBy: [SortBy[Car_Wash_Type.AUTOMATIC][0].value],
  pagination: true,
  page_size: 30,
  userLat: 0,
  userLng: 0,
  page: 1,
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
  const [inlineFilters, setInlineFilters] = useState<FilterState>(filters);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [amenities, setAmenities] = useState<CarServiceAmenity[]>([]);
  const [washTypes, setWashTypes] = useState<CarServiceWashType[]>([]);
  useEffect(() => {
    setInlineFilters(filters);
  }, [filters]);

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
    setFilters(inlineFilters);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side={isMobile ? "bottom" : "left"}
        className="md:h-screen h-[80vh] p-0 rounded-t-xl md:rounded-l-none flex flex-col"
      >
        <SheetHeader className="p-4">
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col px-2 overflow-y-auto h-full gap-4">
          <DistanceRange
            value={inlineFilters.distance}
            onChange={(value) =>
              setInlineFilters((prev) => ({ ...prev, distance: value }))
            }
          />
          <Separator />
          <AmenitiesCheckboxes
            value={inlineFilters.amenities}
            onChange={(value) =>
              setInlineFilters((prev) => ({ ...prev, amenities: value }))
            }
            options={amenities.filter((amenity) => amenity.category == (filters.automaticCarWash ? Car_Wash_Type_Value.AUTOMATIC : Car_Wash_Type_Value.SELF_SERVICE))}
          />
          <Separator />
          <WashTypeCheckboxes
            value={inlineFilters.washType}
            onChange={(value) =>
              setInlineFilters((prev) => ({ ...prev, washType: value }))
            }
            options={washTypes.filter((washType) => washType.category == (filters.automaticCarWash ? Car_Wash_Type_Value.AUTOMATIC : Car_Wash_Type_Value.SELF_SERVICE))}
          />
          <Separator />
          <Ratings
            value={inlineFilters.ratings}
            onChange={(value) =>
              setInlineFilters((prev) => ({ ...prev, ratings: value }))
            }
          />
          <Separator />
          <PriceRange
            value={inlineFilters.priceRange}
            onChange={(value) =>
              setInlineFilters((prev) => ({ ...prev, priceRange: value }))
            }
          />
          <Separator />
          <OperatingHours
            value={inlineFilters.operatingHours}
            onChange={(value) =>
              setInlineFilters((prev) => ({ ...prev, operatingHours: value }))
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
