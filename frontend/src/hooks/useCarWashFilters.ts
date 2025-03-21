import { useState, useEffect } from 'react';
import { FilterState } from "@/types/filters";
import { Car_Wash_Type, SortBy } from "@/utils/constants";

function getFiltersFromParams(params: URLSearchParams): FilterState {
  return {
    automaticCarWash: params.get("automaticCarWash") === "true" || true,    
    washType: params.getAll("washType").map(String),
    ratings: params.getAll("ratings").map(Number),
    distance: Number(params.get("distance")) || 3,
    priceRange: Number(params.get("priceRange")) || 0,
    amenities: params.getAll("amenities").map(String),
    operatingHours: params.getAll("operatingHours").map(String),
    sortBy: params.getAll("sortBy").map(String).length > 0 
      ? params.getAll("sortBy").map(String)
      : [SortBy[Car_Wash_Type.AUTOMATIC][0].value],
    pagination: Boolean(params.get("pagination")) || true,
    page_size: Number(params.get("page_size")) || 30,
    userLat: Number(params.get("userLat")) || 0,
    userLng: Number(params.get("userLng")) || 0,
    page: Number(params.get("page")) || 1,
  };
}

export function useCarWashFilters() {
  const [filters, setFilters] = useState<FilterState>({
    automaticCarWash: true,
    washType: [],
    ratings: [],
    distance: 3,
    priceRange: 0,
    amenities: [],
    operatingHours: [],
    sortBy: [SortBy[Car_Wash_Type.AUTOMATIC][0].value],
    pagination: true,
    page_size: 30,
    userLat: 0,
    userLng: 0,
    page: 1,
  });
  
  // Initialize filters from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFilters(getFiltersFromParams(params));
  }, []);

  // Update URL when filters change
  useEffect(() => {
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
  }, [filters]);

  // Handle browser navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setFilters(getFiltersFromParams(params));
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return { filters, setFilters };
} 