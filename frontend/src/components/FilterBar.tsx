import DistanceRange from "./molecule/DistanceRange";
import WashTypeCheckboxes from "./molecule/WashTypeCheckboxes";
import Ratings from "./molecule/Ratings";
import PriceRange from "./molecule/PriceRange";
import OperatingHours from "./molecule/OperatingHours";
import AmenitiesCheckboxes from "./molecule/AmenitiesCheckboxes";
import { FilterState } from "@/types";
import { Clock } from "lucide-react";
import FilterDropdown from "./molecule/FilterDropdown";
import { ArrowUpDown, Droplet, House, Star, WalletCards } from "lucide-react";

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
        <FilterDropdown
          key={config.key}
          active={config.isActive}
          label={config.label}
          icon={config.icon}
          additionalText={config.additionalText}
          dropdownContent={config.content}
        />
      ))}
    </>
  );
};

export default FilterBar;
