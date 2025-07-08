import { useState, useEffect } from 'react';
import { FilterState } from "@/types/filters";
import { Car_Wash_Type, SortBy } from "@/utils/constants";
import { useSearchParams } from 'next/navigation';

function getFiltersFromParams(params: URLSearchParams): FilterState {
  return {
    automaticCarWash: params.has("automaticCarWash") ? params.get("automaticCarWash") === "true" : true,
    selfServiceCarWash: params.has("selfServiceCarWash") ? params.get("selfServiceCarWash") === "true" : false,
    washTypeName: params.getAll("washTypeName").map(String),
    ratings: params.getAll("ratings").map(Number),
    distance: Number(params.get("distance")) || 3,
    priceRange: Number(params.get("priceRange")) || 0,
    amenityName: params.getAll("amenityName").map(String),
    operatingHours: params.getAll("operatingHours").map(String),
    sortBy: params.getAll("sortBy").map(String).length > 0
      ? params.getAll("sortBy").map(String)
      : [SortBy[Car_Wash_Type.AUTOMATIC][0].value],
    pagination: Boolean(params.get("pagination")) || true,
    page_size: Number(params.get("page_size")) || 30,
    userLat: Number(params.get("userLat")) || 0,
    userLng: Number(params.get("userLng")) || 0,
    page: Number(params.get("page")) || 1,
    offers: params.getAll("offers").map(String),
  };
}

export function useCarWashFilters() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterState>({
    automaticCarWash: true,
    selfServiceCarWash: false,
    washTypeName: [],
    ratings: [],
    distance: 3,
    priceRange: 0,
    amenityName: [],
    operatingHours: [],
    sortBy: [SortBy[Car_Wash_Type.AUTOMATIC][0].value],
    pagination: true,
    page_size: 30,
    userLat: 0,
    userLng: 0,
    page: 1,
    offers: [],
  });

  // Update filters whenever URL params change
  useEffect(() => {
    setFilters(getFiltersFromParams(new URLSearchParams(searchParams.toString())));
  }, [searchParams]);

  // Update URL when filters change - with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const updateUrlWithFilters = () => {
        const params = new URLSearchParams();
        Object.entries(filters)?.forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value?.forEach((item) => params.append(key, item.toString()));
          } else if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
        const queryString = params.toString();
        const newUrl = `${window.location.pathname}?${queryString}`;
        window.history.replaceState(null, "", newUrl);
      };
      updateUrlWithFilters();
    }, 300); // Add a 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [filters]);

  return { filters, setFilters };
} 