"use client";

import { useState, useRef, useEffect } from "react";
import type maplibregl from "maplibre-gl";
import { MobileCarWashView } from "@/components/pages/main/MobileCarWashView";
import { SearchAndFilterBar } from "@/components/pages/main/SearchAndFilterBar";
import Topbar from "@/components/pages/main/Topbar";
import { useCarWashFilters } from "@/hooks/useCarWashFilters";
import { useCarWashes } from "@/hooks/useCarWashes";
import { CarWashResponse, ICarWashCard } from "@/types";
import { RadarMap } from "@/components/organism/RadarMap";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CarWashCard } from "@/components/organism/carWashCard";
import CarWashDetail from "@/components/pages/main/about/CarWashDetail";
import { SortBySelect } from "@/components/ui/sortBySelect";
import { LoadingSpinner } from "@/components/ui/spinner";

export default function Home() {
  const RADAR_KEY = process.env.NEXT_PUBLIC_RADAR_API_KEY;
  const [openAbout, setOpenAbout] = useState(false);
  const [selectedCarWash, setSelectedCarWash] = useState<CarWashResponse | null>(
    null
  );

  const [showMap, setShowMap] = useState(true);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const { filters, setFilters } = useCarWashFilters();
  const { carWashes, isLoading } = useCarWashes(filters);

  const handleMapReady = (map: maplibregl.Map) => (mapRef.current = map);

  const handleOpenAbout = (selectedCarWash: CarWashResponse) => {
    setSelectedCarWash(selectedCarWash);
    setOpenAbout(true);
  };

  const handleNavigateToLocation = (location: { lat: number; lng: number }) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [location.lng, location.lat],
        zoom: 15,
        essential: true,
      });
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Topbar filters={filters} setFilters={setFilters} />
      <SearchAndFilterBar
        filters={filters}
        setFilters={setFilters}
        showMap={showMap}
        setShowMap={setShowMap}
        handleNavigateToLocation={handleNavigateToLocation}
      />
      <div className="flex flex-1 overflow-hidden bg-neutral-100 relative">
        <div className="w-[550px] relative bg-white hidden md:block">
          <div className="flex justify-between py-2 px-4">
            <div className="flex items-center gap-2">Showing {carWashes.length} results {isLoading && <LoadingSpinner />}</div>
            <SortBySelect
              filters={filters}
              setFilters={setFilters}
            />
          </div>
          <ScrollArea className="w-full h-full">
            <div className="flex flex-col gap-2 pr-4">
              {carWashes?.map((carWash) => (
                <CarWashCard
                  key={carWash.id}
                  data={carWash}
                  onClick={() => handleOpenAbout(carWash)}
                />
              ))}
            </div>
          </ScrollArea>
          <CarWashDetail
            data={selectedCarWash}
            open={openAbout}
            setOpen={setOpenAbout}
            onNavigate={handleNavigateToLocation}
          />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <RadarMap
            publishableKey={RADAR_KEY || ""}
            carWashes={carWashes}
            onMapReady={handleMapReady}
          />
        </div>
        <MobileCarWashView
          showMap={showMap}
          carWashes={carWashes}
          selectedCarWash={selectedCarWash}
          onCarWashSelect={handleOpenAbout}
          filters={filters}
          setFilters={setFilters}
        />
      </div>
    </div>
  );
}
