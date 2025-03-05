import { FilterState } from "@/types/filters";
import SearchBar from "@/components/molecule/SearchBar";
import FilterComponent from "@/components/pages/main/filter/FilterComponent";
import { Button } from "@/components/ui/button";

interface SearchAndFilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  showMap: boolean;
  setShowMap: (show: boolean) => void;
}

export function SearchAndFilterBar({
  filters,
  setFilters,
  showMap,
  setShowMap,
}: SearchAndFilterBarProps) {
  const handleSearch = (search: string) => {
    setFilters({
      ...filters,
      searchKey: search,
    });
  };

  return (
    <>
      <SearchBar onChange={handleSearch} />
      <div className="flex items-center justify-between px-4">
        <FilterComponent filters={filters} setFilters={setFilters} />
        <Button
          variant="outline"
          className="rounded-full shadow-none text-title-2 border-neutral-100"
          onClick={() => setShowMap(!showMap)}
        >
          <input checked={showMap} readOnly id="disabled-checked-checkbox" type="checkbox" value="" className="w-4 h-4 text-blue-500 border-gray-300 rounded-md checked:bg-blue-500 checked:border-blue-500"></input>
          Show map
        </Button>
      </div>
    </>
  );
} 