import { FilterState } from "@/types/filters";
import SearchBar from "@/components/molecule/SearchBar";
import FilterComponent from "@/components/pages/main/filter/FilterComponent";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import useGeoLocationData from "@/hooks/useGeoLocationData";
import { RadarAddress } from "radar-sdk-js/dist/types";
import useLocationData from "@/hooks/useLocationData";

interface SearchAndFilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  showMap: boolean;
  setShowMap: (show: boolean) => void;
  handleNavigateToLocation: (location: { lat: number; lng: number }) => void;
}

export function SearchAndFilterBar({
  filters,
  setFilters,
  showMap,
  setShowMap,
  handleNavigateToLocation,
}: SearchAndFilterBarProps) {
  // const { latitude, longitude, loading, error, fetchLocationData } = useGeoLocationData();
  const {
    locationData,
    error: locationError,
    loading: locationLoading,
    fetchLocationData: fetchLocationData,
  } = useLocationData();
  const [address, setAddress] = useState<RadarAddress | null>(null);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  useEffect(() => {
    fetchLocationData();
  }, []);
  useEffect(() => {
    if (locationData && !currentLocation) {
      setCurrentLocation(locationData);
    }
    if (address) {
      setFilters({
        ...filters,
        userLat: address.latitude,
        userLng: address.longitude,
      });
      handleNavigateToLocation({
        lat: address.latitude ?? 0,
        lng: address.longitude ?? 0,
      });
    } else if (locationData) {
      setFilters({
        ...filters,
        userLat: locationData.location.coordinates[1],
        userLng: locationData.location.coordinates[0],
      });
      handleNavigateToLocation({
        lat: locationData.location.coordinates[1],
        lng: locationData.location.coordinates[0],
      });
    }
  }, [locationData, address]);

  const handleChange = (address: RadarAddress | null) => {
    setAddress(address);
  };
  return (
    <>
      <div className="flex items-center gap-2">
        <SearchBar onChange={handleChange} currentLocation={currentLocation} />
      </div>
      {locationError && (
        <div className="text-red-500 text-sm px-4">{locationError}</div>
      )}
      <div className="flex items-center justify-between px-4">
        <FilterComponent filters={filters} setFilters={setFilters} />
        <Button
          variant="outline"
          className="rounded-full shadow-none text-title-2 border-neutral-100 md:hidden"
          onClick={() => setShowMap(!showMap)}
        >
          <input
            checked={showMap}
            readOnly
            id="disabled-checked-checkbox"
            type="checkbox"
            value=""
            className="w-4 h-4 text-blue-500 border-gray-300 rounded-md checked:bg-blue-500 checked:border-blue-500"
          ></input>
          Show map
        </Button>
      </div>
    </>
  );
}
