import DistanceRange from "@/components/molecule/DistanceRange";
import WashTypeCheckboxes from "@/components/molecule/WashTypeCheckboxes";
import Ratings from "@/components/molecule/RatingCheckboxes";
import PriceRange from "@/components/molecule/PriceRange";
import OperatingHours from "@/components/molecule/OperatingHoursCheckboxes";
import AmenitiesCheckboxes from "@/components/molecule/AmenitiesCheckboxes";
import { Button } from "@/components/ui/button";
import { FilterState, IAmenity, IWashType } from "@/types";
import { ChevronDown, Clock, Gift } from "lucide-react";
import { ArrowUpDown, Droplet, House, Star, WalletCards } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Amenities, Car_Wash_Type_Value, INITIAL_FILTER_STATE } from "@/utils/constants";
import { getAmenities } from "@/services/AmenityService";
import { useWashTypes } from "@/contexts/WashTypesContext";
import OfferCheckboxes from "@/components/molecule/OfferCheckboxes";
interface FilterBarProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters }) => {
  const [inlineFilters, setInlineFilters] = useState<FilterState>(filters);
  const [amenities, setAmenities] = useState<IAmenity[]>([]);
  const { washTypes } = useWashTypes();

  useEffect(() => {
    const fetchAmenities = async () => {
      const amenities = await getAmenities();
      setAmenities(amenities);
    };
    fetchAmenities();
  }, []);

  useEffect(() => {
    setInlineFilters(filters);
  }, [filters]);

  const handleApplyFilters = () => {
    setFilters({
      ...inlineFilters,
      page: 1
    });
  }

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
            options={washTypes.filter((washType) => washType.category == ((filters.automaticCarWash == true ? Car_Wash_Type_Value.AUTOMATIC : Car_Wash_Type_Value.SELF_SERVICE)) || null)}
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
            options={amenities.filter((amenity) => amenity.category == (filters.automaticCarWash == true ? Car_Wash_Type_Value.AUTOMATIC : Car_Wash_Type_Value.SELF_SERVICE) || null)}
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
    {
      key: "offers",
      label: "Offer",
      icon: <Gift size={16} />,
      isActive: inlineFilters.offers.length > 0,
      content: (
        <OfferCheckboxes
          value={inlineFilters.offers}
          onChange={(value) =>
            setInlineFilters({ ...inlineFilters, offers: value })
          }
        />
      ),
    },
  ];

  const handleResetFilters = () => {
    setFilters({
      ...INITIAL_FILTER_STATE,
      userLat: filters.userLat,
      userLng: filters.userLng,
    });
  };
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
              {config.additionalText && (
                <div className="text-body-2 text-neutral-900 w-14">
                  {config.additionalText}
                </div>
              )}
              <ChevronDown className="text-neutral-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mt-2 shadow-md border-none rounded-xl">
            {config.content}
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
      <Button variant="ghost" className="rounded-full" onClick={handleResetFilters}>Reset Filters</Button>
      <Button className="rounded-full" onClick={handleApplyFilters}>Apply Filters</Button>
    </>
  );
};

export default FilterBar;
