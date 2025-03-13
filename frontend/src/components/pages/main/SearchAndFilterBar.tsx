import { FilterState } from "@/types/filters";
import SearchBar from "@/components/molecule/SearchBar";
import FilterComponent from "@/components/pages/main/filter/FilterComponent";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import useGeoLocationData from "@/hooks/useGeoLocationData";
import { RadarAddress } from "radar-sdk-js/dist/types";

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
  const { latitude, longitude, loading, error, fetchLocationData } = useGeoLocationData();
  const [address, setAddress] = useState<RadarAddress | null>(null);
  useEffect(() => {
    fetchLocationData();
  }, [])
  useEffect(() => {
    if (address) {
      setFilters({
        ...filters,
        userLat: address.latitude,
        userLng: address.longitude,
      })
    } else if (latitude && longitude) {
      setFilters({
        ...filters,
        userLat: latitude,
        userLng: longitude,
      })
    }
  }, [latitude, longitude, address])


  const handleChange = (address: RadarAddress | null) => {
    setAddress(address);
  }
  return (
    <>
      <div className="flex items-center gap-2">
        <SearchBar onChange={handleChange} />
      </div>
      {error && <div className="text-red-500 text-sm px-4">{error}</div>}
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
