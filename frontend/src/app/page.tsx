"use client";

import { useState, useRef } from "react";
import type maplibregl from "maplibre-gl";
import { CarWashListView } from "@/components/pages/main/CarWashListView";
import { MobileCarWashView } from "@/components/pages/main/MobileCarWashView";
import { SearchAndFilterBar } from "@/components/pages/main/SearchAndFilterBar";
import Topbar from "@/components/pages/main/Topbar";
import { useCarWashFilters } from "@/hooks/useCarWashFilters";
import { useCarWashes } from "@/hooks/useCarWashes";
import { ICarWashCard } from "@/types";
import { RadarMap } from "@/components/organism/RadarMap";

export default function Home() {
  const RADAR_KEY = process.env.NEXT_PUBLIC_RADAR_API_KEY;
  const [openAbout, setOpenAbout] = useState(false);
  const [selectedCarWash, setSelectedCarWash] = useState<ICarWashCard | null>(
    null
  );
  const [showMap, setShowMap] = useState(true);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const { filters, setFilters } = useCarWashFilters();
  const { carWashes } = useCarWashes(filters);

  const handleMapReady = (map: maplibregl.Map) => (mapRef.current = map);

  const handleOpenAbout = (selectedCarWash: ICarWashCard) => {
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
      />
      <div className="flex flex-1 overflow-hidden bg-neutral-100 relative">
        <CarWashListView
          carWashes={carWashes}
          openAbout={openAbout}
          setOpenAbout={setOpenAbout}
          selectedCarWash={selectedCarWash}
          onCarWashSelect={handleOpenAbout}
          onNavigate={handleNavigateToLocation}
        />
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
        />
      </div>
    </div>
  );
}
