"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import FilterPanel from "@/components/FilterPanel";
import type { FilterState } from "@/types";

export default function Home() {
  const [open, setOpen] = useState(false);

  const handleApplyFilters = (filters: FilterState) => {
    // Handle filter application logic here
    console.log('Applied filters:', filters);
  };

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <Button onClick={() => setOpen(true)}>Open Filters</Button>
      <FilterPanel 
        open={open} 
        setOpen={setOpen} 
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
}
