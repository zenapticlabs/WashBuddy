"use client";

import { CarWashCard } from "@/components/organism/carWashCard";
import { mockCarWashes } from "@/mocks/carWashes";
import Topbar from "@/components/pages/main/Topbar";
import SearchBar from "@/components/molecule/SearchBar";
import { useState } from "react";
import FilterComponent from "@/components/pages/main/filter/FilterComponent";
import { FilterState } from "@/types/filters";
import { RadarMap } from "@/components/organism/RadarMap";

export default function Home() {
  const [searchKey, setSearchKey] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    washType: [],
    ratings: [],
    distanceRange: 0,
    priceRange: 0,
    amenities: [],
    operatingHours: [],
  });
  const handleSearch = (search: string) => {
    setSearchKey(search);
  };
  return (
    <div className="flex flex-col p-4 h-screen">
      <Topbar />
      <SearchBar onChange={handleSearch} />
      <FilterComponent filters={filters} setFilters={setFilters} />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[550px] flex flex-col gap-2 overflow-y-auto">
          {mockCarWashes.map((carWash) => (
            <CarWashCard key={carWash.id} data={carWash} />
          ))}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <RadarMap
            publishableKey={
              "prj_test_pk_144a114b9cb33385a5595eb5b90c071490484be1"
            }
          />
        </div>
      </div>
    </div>
  );
}
