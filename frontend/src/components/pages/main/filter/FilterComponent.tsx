import { Button } from "../../../ui/button";
import { FilterState } from "@/types/filters";
import { SlidersVertical } from "lucide-react";
import { CircleBadge } from "../../../ui/circleBadge";
import FilterBar from "./FilterBar";
import { useState } from "react";
import FilterPanel from "./FilterPanel";

export interface FilterComponentProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const FilterComponent: React.FC<FilterComponentProps> = ({
  filters,
  setFilters,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex gap-2 py-4">
      <Button
        variant="ghost"
        className="px-4 py-2 h-auto rounded-full"
        onClick={() => setOpen(!open)}
      >
        <SlidersVertical size={16} />
        Filters
        <CircleBadge
          text={String(
            filters.amenities.length +
            filters.washType.length +
            filters.ratings.length +
            filters.operatingHours.length +
            (filters.distanceRange > 0 ? 1 : 0) +
            (filters.priceRange > 0 ? 1 : 0)
          )}
        />
      </Button>
      <div className="hidden md:flex flex-wrap gap-2 ">
        <FilterBar filters={filters} setFilters={setFilters} />
      </div>
      <FilterPanel
        open={open}
        setOpen={setOpen}
        filters={filters}
        setFilters={setFilters}
      />
    </div>
  );
};

export default FilterComponent;
