"use client";
import { useState } from "react";
import type { FilterState } from "@/types";
import FilterComponent from "@/components/FilterComponent";
import SearchBar from "@/components/molecule/SearchBar";
import Topbar from "@/components/Topbar";
import CarWashDetailPage from "@/components/about/CarWashDetailPage";

const initialFilterState: FilterState = {
  distanceRange: 0,
  amenities: [],
  washType: [],
  ratings: [],
  priceRange: 0,
  operatingHours: [],
};

export default function Home() {
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [search, setSearch] = useState("");
  return (
    <div className="px-2">
      <Topbar />
      <SearchBar onChange={setSearch} />
      <div className="flex gap-2 justify-between">
        <FilterComponent filters={filters} setFilters={setFilters} />
      </div>
      <CarWashDetailPage />
    </div>
  );
}
