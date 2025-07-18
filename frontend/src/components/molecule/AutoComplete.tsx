import React, { useState, useRef } from "react";
import { Input } from "../ui/input";
import { MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { RadarAddress } from "radar-sdk-js/dist/types";

interface AutoCompleteProps {
  onSelect: (address: RadarAddress | null) => void; // Modified to pass full address object
  inputValue: string;
  setInputValue: (value: string) => void;
  currentLocation: any;
}

const AutoComplete: React.FC<AutoCompleteProps> = ({
  onSelect,
  inputValue,
  setInputValue,
  currentLocation,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<RadarAddress[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  // Add debouncing to prevent too many API calls
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Fetch suggestions from Radar API
  const fetchSuggestions = async (query: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.radar.io/v1/search/autocomplete?query=${encodeURIComponent(
          query
        )}&country=US`,
        {
          headers: {
            Authorization: `${process.env.NEXT_PUBLIC_RADAR_API_KEY}`,
          },
        }
      );
      const data = await response.json();
      setSuggestions(data.addresses || []);
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
      setSuggestions([]);
    }
  };

  const debouncedFetchSuggestions = debounce(fetchSuggestions, 300);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      setInputValue(value);
      debouncedFetchSuggestions(value);
    } else {
      onSelect(null);
      setInputValue("");
      setSuggestions([]);
    }
  };

  const handleSelectAddress = (address: RadarAddress) => {
    onSelect(address);
    setInputValue(address.formattedAddress || "");
    setSuggestions([]);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsFocused(false);
    }, 200);
  };

  const handleSelectCurrentLocation = () => {
    const tempCurrentLocation: RadarAddress = {
      addressLabel: currentLocation.address,
      city: currentLocation.city,
      state: currentLocation.state,
      stateCode: currentLocation.state_code,
      country: currentLocation.country,
      countryCode: currentLocation.country_code,
      formattedAddress: currentLocation.formatted_address,
      geometry: {
        type: "Point",
        coordinates: [
          currentLocation.location.coordinates[0],
          currentLocation.location.coordinates[1],
        ],
      },
      latitude: currentLocation.location.coordinates[1],
      longitude: currentLocation.location.coordinates[0],
    };
    onSelect(tempCurrentLocation);
    setInputValue(tempCurrentLocation.formattedAddress || "");
    setSuggestions([]);
  };
  return (
    <div ref={wrapperRef} className="relative">
      <div className={cn("relative w-full lg:w-[640px]")}>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search size={20} className="text-blue-500" />
        </div>
        <Input
          type="text"
          placeholder="Search car washes location"
          className="rounded-full text-sm py-3.5 border-[#189DEF80] border-2 pl-10 w-full"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
        />
      </div>
      {isFocused && (
        <ul className="absolute z-20 w-full lg:w-[640px] mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-y-auto">
          <li
            onClick={() => handleSelectCurrentLocation()}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
          >
            <MapPin size={20} className="text-blue-500" />
            Use Current Location
          </li>
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSelectAddress(suggestion)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {suggestion.formattedAddress}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutoComplete;
