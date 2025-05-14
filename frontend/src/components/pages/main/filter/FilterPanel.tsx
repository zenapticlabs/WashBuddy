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
import { Amenities, Car_Wash_Type, Car_Wash_Type_Value, SortBy, WashTypes } from "@/utils/constants";
import useMediaQuery from "@/hooks/useMediaQuery";
import AutomaticIcon from "@/assets/icons/automatic.svg";
import SelfServiceIcon from "@/assets/icons/self-service.svg";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { getAmenities } from "@/services/AmenityService";
import { IAmenity, IWashType } from "@/types";
import { getWashTypes } from "@/services/WashType";

const initialFilterState: FilterState = {
  automaticCarWash: true,
  selfServiceCarWash: false,
  distance: 3,
  amenityName: [],
  washTypeName: [],
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

const FilterButtonConfigs = [
  {
    icon: AutomaticIcon,
    value: true,
    label: Car_Wash_Type.AUTOMATIC,
  },
  {
    icon: SelfServiceIcon,
    value: false,
    label: Car_Wash_Type.SELF_SERVICE,
  },
];

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
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [amenities, setAmenities] = useState<IAmenity[]>([]);
  const [washTypes, setWashTypes] = useState<IWashType[]>([]);
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
    setFilters({
      ...inlineFilters,
      page: 1
    });
    setOpen(false);
  };

  const handleSelectCarWashType = (value: boolean) => {
    if (pathname !== "/") {
      // If not on dashboard, navigate to dashboard with filter params
      const params = new URLSearchParams();
      params.append("automaticCarWash", value.toString());
      params.append("selfServiceCarWash", (!value).toString());
      params.append(
        "sortBy",
        SortBy[value ? Car_Wash_Type.AUTOMATIC : Car_Wash_Type.SELF_SERVICE][0]
          .value
      );
      router.push(`/?${params.toString()}`);
    } else if (filters && setFilters) {
      // If on dashboard, update filters directly
      setFilters({
        ...filters,
        automaticCarWash: value,
        selfServiceCarWash: !value,
        sortBy: [
          SortBy[
            value ? Car_Wash_Type.AUTOMATIC : Car_Wash_Type.SELF_SERVICE
          ][0].value,
        ],
      });
    }
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
          <div className="flex gap-2">
            {FilterButtonConfigs.map((config) => (
              <Button
                variant="outline"
                key={config.label}
                onClick={() => handleSelectCarWashType(config.value)}
                className={`rounded-full shadow-none ${filters?.automaticCarWash === config.value
                  ? "border-blue-500"
                  : "border-neutral-100"
                  }`}
              >
                <Image
                  src={config.icon}
                  alt={config.label}
                  width={24}
                  height={24}
                  className={`${filters?.automaticCarWash === config.value ? "filter-blue-500" : ""}`}
                />
                <span className="text-title-2 text-neutral-900">
                  {config.label}
                </span>
              </Button>
            ))}
          </div>
          <DistanceRange
            value={inlineFilters.distance}
            onChange={(value) =>
              setInlineFilters((prev) => ({ ...prev, distance: value }))
            }
          />
          <Separator />
          <AmenitiesCheckboxes
            value={inlineFilters.amenityName}
            onChange={(value) =>
              setInlineFilters((prev) => ({ ...prev, amenityName: value }))
            }
            options={amenities.filter((amenity) => amenity.category == (filters.automaticCarWash ? Car_Wash_Type_Value.AUTOMATIC : Car_Wash_Type_Value.SELF_SERVICE) || null)}
          />
          <Separator />
          <WashTypeCheckboxes
            value={inlineFilters.washTypeName}
            onChange={(value) =>
              setInlineFilters((prev) => ({ ...prev, washTypeName: value }))
            }
            options={washTypes.filter((washType) => washType.category == (filters.automaticCarWash ? Car_Wash_Type_Value.AUTOMATIC : Car_Wash_Type_Value.SELF_SERVICE) || null)}
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
