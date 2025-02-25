import DistanceRange from "@/components/molecule/DistanceRange";
import WashTypeCheckboxes from "@/components/molecule/WashTypeCheckboxes";
import Ratings from "@/components/molecule/RatingCheckboxes";
import PriceRange from "@/components/molecule/PriceRange";
import OperatingHours from "@/components/molecule/OperatingHoursCheckboxes";
import AmenitiesCheckboxes from "@/components/molecule/AmenitiesCheckboxes";
import { Button } from "@/components/ui/button";
import { FilterState } from "@/types";
import { ChevronDown, Clock } from "lucide-react";
import { ArrowUpDown, Droplet, House, Star, WalletCards } from "lucide-react";
import { MockAmenities, MockWashTypes } from "@/mocks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters }) => {
  const filterConfigs = [
    {
      key: "distanceRange",
      label: "Distance",
      icon: <ArrowUpDown size={16} />,
      isActive: filters.distanceRange > 0,
      additionalText: `: ${filters.distanceRange} miles`,
      content: (
        <div className="w-[450px] pt-2">
          <DistanceRange
            value={filters.distanceRange}
            onChange={(value) =>
              setFilters({ ...filters, distanceRange: value })
            }
          />
        </div>
      ),
    },
    {
      key: "ratings",
      label: "Ratings",
      icon: <Star size={16} />,
      isActive: filters.ratings.length > 0,
      content: (
        <Ratings
          value={filters.ratings}
          onChange={(value) => setFilters({ ...filters, ratings: value })}
        />
      ),
    },
    {
      key: "priceRange",
      label: "Price range",
      icon: <WalletCards size={16} />,
      isActive: filters.priceRange > 0,
      content: (
        <div className="w-[450px] pt-2">
          <PriceRange
            value={filters.priceRange}
            onChange={(value) => setFilters({ ...filters, priceRange: value })}
          />
        </div>
      ),
    },
    {
      key: "washType",
      label: "Wash type",
      icon: <Droplet size={16} />,
      isActive: filters.washType.length > 0,
      content: (
        <WashTypeCheckboxes
          value={filters.washType}
          onChange={(value) => setFilters({ ...filters, washType: value })}
          options={MockWashTypes}
        />
      ),
    },
    {
      key: "amenities",
      label: "Amenities",
      icon: <House size={16} />,
      isActive: filters.amenities.length > 0,
      content: (
        <AmenitiesCheckboxes
          value={filters.amenities}
          onChange={(value) => setFilters({ ...filters, amenities: value })}
          options={MockAmenities}
        />
      ),
    },
    {
      key: "operatingHours",
      label: "Operating hours",
      icon: <Clock size={16} />,
      isActive: filters.operatingHours.length > 0,
      content: (
        <OperatingHours
          value={filters.operatingHours}
          onChange={(value) =>
            setFilters({ ...filters, operatingHours: value })
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
    </>
  );
};

export default FilterBar;
