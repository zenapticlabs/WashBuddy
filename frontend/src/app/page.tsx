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
import { CarWashSkeleton } from "@/components/organism/carWashSkeleton";
import { CustomPagination } from "@/components/molecule/CustomPagination";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function Home() {
  const RADAR_KEY = process.env.NEXT_PUBLIC_RADAR_API_KEY;
  const [openAbout, setOpenAbout] = useState(false);
  const [selectedCarWash, setSelectedCarWash] =
    useState<CarWashResponse | null>(null);

  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const { filters, setFilters } = useCarWashFilters();
  const { carWashes, isLoading, count, totalPages, currentPage } =
    useCarWashes(filters);

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
    <ProtectedRoute>
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
          <div className="w-[550px] relative bg-white hidden md:flex flex-col">
            <div className="flex justify-end py-2 px-4">
              <SortBySelect filters={filters} setFilters={setFilters} />
            </div>
            <ScrollArea className="w-full flex-1">
              <div className="flex flex-col gap-2 pr-4">
                {isLoading && (
                  <div className="flex flex-col gap-2">
                    <CarWashSkeleton />
                    <CarWashSkeleton />
                    <CarWashSkeleton />
                    <CarWashSkeleton />
                    <CarWashSkeleton />
                    <CarWashSkeleton />
                  </div>
                )}
                {!isLoading &&
                  carWashes?.map((carWash) => (
                    <CarWashCard
                      key={carWash.id}
                      data={carWash}
                      onClick={() => handleOpenAbout(carWash)}
                    />
                  ))}
              </div>
            </ScrollArea>
            <div className="px-4 py-4">
              <CustomPagination
                currentPage={filters.page}
                totalItems={count}
                pageSize={filters.page_size}
                onPageChange={(page: number) =>
                  setFilters({ ...filters, page })
                }
              />
            </div>
            <CarWashDetail
              data={selectedCarWash}
              open={openAbout}
              setOpen={setOpenAbout}
              onNavigate={handleNavigateToLocation}
            />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <RadarMap
              showMap={showMap}
              publishableKey={RADAR_KEY || ""}
              carWashes={carWashes}
              onMapReady={handleMapReady}
            />
          </div>
          <MobileCarWashView
            totalCount={count}
            isLoading={isLoading}
            showMap={showMap}
            carWashes={carWashes}
            selectedCarWash={selectedCarWash}
            onCarWashSelect={handleOpenAbout}
            filters={filters}
            setFilters={setFilters}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
