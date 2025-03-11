import { useState, useEffect } from 'react';
import { FilterState } from "@/types/filters";
import { Car_Wash_Type, SortBy } from "@/utils/constants";
import useLocationData from './useLocationData';

function getFiltersFromParams(params: URLSearchParams): FilterState {
  return {
    carWashType: params.get("carWashType") || Car_Wash_Type.AUTOMATIC,
    washType: params.getAll("washType").map(String),
    ratings: params.getAll("ratings").map(Number),
    distance: Number(params.get("distance")) || 0,
    priceRange: Number(params.get("priceRange")) || 0,
    amenities: params.getAll("amenities").map(String),
    operatingHours: params.getAll("operatingHours").map(String),
    sortBy: params.get("sortBy") || "",
    pagination: Boolean(params.get("pagination")) || true,
    page_size: Number(params.get("page_size")) || 3,
    userLat: Number(params.get("userLat")) || 0,
    userLng: Number(params.get("userLng")) || 0,
  };
}

export function useCarWashFilters() {
  const [filters, setFilters] = useState<FilterState>({
    carWashType: Car_Wash_Type.AUTOMATIC,
    washType: [],
    ratings: [],
    distance: 0,
    priceRange: 0,
    amenities: [],
    operatingHours: [],
    sortBy: SortBy[Car_Wash_Type.AUTOMATIC][0],
    pagination: true,
    page_size: 3,
    userLat: 0,
    userLng: 0,
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

  useEffect(() => {
    setFilters({ ...filters, sortBy: SortBy[filters.carWashType][0] });
  }, [filters.carWashType]);

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