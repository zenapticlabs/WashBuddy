import { useState, useEffect } from 'react';
import { FilterState } from "@/types/filters";
import { Car_Wash_Type } from "@/utils/constants";

function getFiltersFromParams(params: URLSearchParams): FilterState {
  return {
    carWashType: params.get("carWashType") || Car_Wash_Type.AUTOMATIC,
    searchKey: params.get("searchKey") || "",
    washType: params.getAll("washType").map(String),
    ratings: params.getAll("ratings").map(Number),
    distanceRange: Number(params.get("distanceRange")) || 0,
    priceRange: Number(params.get("priceRange")) || 0,
    amenities: params.getAll("amenities").map(String),
    operatingHours: params.getAll("operatingHours").map(String),
  };
}

export function useCarWashFilters() {
  const [filters, setFilters] = useState<FilterState>({
    carWashType: Car_Wash_Type.AUTOMATIC,
    searchKey: "",
    washType: [],
    ratings: [],
    distanceRange: 0,
    priceRange: 0,
    amenities: [],
    operatingHours: [],
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