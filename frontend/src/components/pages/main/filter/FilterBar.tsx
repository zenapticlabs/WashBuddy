import DistanceRange from "@/components/molecule/DistanceRange";
import WashTypeCheckboxes from "@/components/molecule/WashTypeCheckboxes";
import Ratings from "@/components/molecule/RatingCheckboxes";
import PriceRange from "@/components/molecule/PriceRange";
import OperatingHours from "@/components/molecule/OperatingHoursCheckboxes";
import AmenitiesCheckboxes from "@/components/molecule/AmenitiesCheckboxes";
import { Button } from "@/components/ui/button";
import { CarServiceAmenity, CarServiceWashType, FilterState } from "@/types";
import { ChevronDown, Clock } from "lucide-react";
import { ArrowUpDown, Droplet, House, Star, WalletCards } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getAmenities } from "@/services/AmenityService";
import { getWashTypes } from "@/services/WashType";
import { Amenities, Car_Wash_Type_Value, WashTypes } from "@/utils/constants";
interface FilterBarProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters }) => {
  const [inlineFilters, setInlineFilters] = useState<FilterState>(filters);
  const [amenities, setAmenities] = useState<CarServiceAmenity[]>([]);
  const [washTypes, setWashTypes] = useState<CarServiceWashType[]>([]);

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

  useEffect(() => {
    setInlineFilters(filters);
  }, [filters]);


  const filterConfigs = [
    {
      key: "distance",
      label: "Distance",
      icon: <ArrowUpDown size={16} />,
      isActive: inlineFilters.distance > 0,
      additionalText: `: ${inlineFilters.distance} miles`,
      content: (
        <div className="w-[450px] pt-2">
          <DistanceRange
            value={inlineFilters.distance}
            onChange={(value) =>
              setInlineFilters({ ...inlineFilters, distance: value })
            }
          />
        </div>
      ),
    },
    {
      key: "ratings",
      label: "Ratings",
      icon: <Star size={16} />,
      isActive: inlineFilters.ratings.length > 0,
      content: (
        <Ratings
          value={inlineFilters.ratings}
          onChange={(value) => setInlineFilters({ ...inlineFilters, ratings: value })}
        />
      ),
    },
    {
      key: "priceRange",
      label: "Price range",
      icon: <WalletCards size={16} />,
      isActive: inlineFilters.priceRange > 0,
      content: (
        <div className="w-[450px] pt-2">
          <PriceRange
            value={inlineFilters.priceRange}
            onChange={(value) => setInlineFilters({ ...inlineFilters, priceRange: value })}
          />
        </div>
      ),
    },
    {
      key: "washType",
      label: "Wash type",
      icon: <Droplet size={16} />,
      isActive: inlineFilters.washTypeName.length > 0,
      content: (
        <div className="w-[500px] pt-2">
          <WashTypeCheckboxes
            value={inlineFilters.washTypeName}
            onChange={(value) => setInlineFilters({ ...inlineFilters, washTypeName: value })}
            options={WashTypes.filter((washType) => washType.category == (filters.automaticCarWash ? Car_Wash_Type_Value.AUTOMATIC : Car_Wash_Type_Value.SELF_SERVICE))}
          />
        </div>
      ),
    },
    {
      key: "amenities",
      label: "Amenities",
      icon: <House size={16} />,
      isActive: inlineFilters.amenityName.length > 0,
      content: (
        <div className="w-[500px] pt-2">
          <AmenitiesCheckboxes
            value={inlineFilters.amenityName}
            onChange={(value) => setInlineFilters({ ...inlineFilters, amenityName: value })}
            options={Amenities.filter((amenity) => amenity.category == (filters.automaticCarWash ? Car_Wash_Type_Value.AUTOMATIC : Car_Wash_Type_Value.SELF_SERVICE))}
          />
        </div>
      ),
    },
    {
      key: "operatingHours",
      label: "Operating hours",
      icon: <Clock size={16} />,
      isActive: inlineFilters.operatingHours.length > 0,
      content: (
        <OperatingHours
          value={inlineFilters.operatingHours}
          onChange={(value) =>
            setInlineFilters({ ...inlineFilters, operatingHours: value })
          }
        />
      ),
    },
  ];

  return (
    <>
      {filterConfigs.map((config) => (
        <DropdownMenu key={config.key}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              className={cn(
                "px-4 py-2 h-auto rounded-full",
                config.isActive && "bg-blue-100"
              )}
            >
              {config.icon}
              <div className="text-body-2 text-neutral-900">{config.label}</div>
              <div className="text-body-2 text-neutral-900">
                {config.additionalText}
              </div>
              <ChevronDown className="text-neutral-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mt-2 shadow-md border-none rounded-xl">
            {config.content}
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
      <Button variant="ghost" className="rounded-full" onClick={() => setInlineFilters(filters)}>Reset Filters</Button>
      <Button className="rounded-full" onClick={() => setFilters(inlineFilters)}>Apply Filters</Button>
    </>
  );
};

export default FilterBar;
