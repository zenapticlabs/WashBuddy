"use client";

import { useState, useRef, useEffect, Suspense } from "react";
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
import { useSearchParams } from "next/navigation";
import { Car_Wash_Type, SortBy } from "@/utils/constants";
import { Loader2 } from "lucide-react";
import useLocationData from "@/hooks/useLocationData";
import { RadarAddress } from "radar-sdk-js/dist/types";

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="absolute inset-0 z-50 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const RADAR_KEY = process.env.NEXT_PUBLIC_RADAR_API_KEY;
  const searchParams = useSearchParams();
  const [openAbout, setOpenAbout] = useState(false);
  const [selectedCarWash, setSelectedCarWash] =
    useState<CarWashResponse | null>(null);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [address, setAddress] = useState<RadarAddress | null>(null);
  const {
    locationData,
    error: locationError,
    loading: locationLoading,
    fetchLocationData: fetchLocationData,
  } = useLocationData();

  const { filters, setFilters } = useCarWashFilters();
  const { carWashes, isLoading, count, totalPages, currentPage } =
    useCarWashes(filters);

  useEffect(() => {
    fetchLocationData();
  }, []);

  useEffect(() => {
    if (locationData && !currentLocation) {
      setCurrentLocation(locationData);
    }
    if (address) {
      handleNavigateToLocation({
        lat: address.latitude ?? 0,
        lng: address.longitude ?? 0,
      });
      setFilters({
        ...filters,
        userLat: address.latitude,
        userLng: address.longitude,
      });
    } else if (locationData) {
      setFilters({
        ...filters,
        userLat: locationData.location.coordinates[1],
        userLng: locationData.location.coordinates[0],
      });
      handleNavigateToLocation({
        lat: locationData.location.coordinates[1],
        lng: locationData.location.coordinates[0],
      });
    }
  }, [locationData, address]);
  // Handle URL parameters for filters - only on initial mount
  useEffect(() => {
    const automaticCarWash = searchParams.get("automaticCarWash");
    const selfServiceCarWash = searchParams.get("selfServiceCarWash");
    const sortBy = searchParams.get("sortBy");

    if (
      automaticCarWash !== null ||
      selfServiceCarWash !== null ||
      sortBy !== null
    ) {
      // Add a check to prevent unnecessary updates
      const newAutomaticCarWash = automaticCarWash === "true";
      const newSelfServiceCarWash = selfServiceCarWash === "true";
      const newSortBy = sortBy
        ? [sortBy]
        : [SortBy[Car_Wash_Type.AUTOMATIC][0].value];

      if (
        filters.automaticCarWash !== newAutomaticCarWash ||
        filters.selfServiceCarWash !== newSelfServiceCarWash ||
        JSON.stringify(filters.sortBy) !== JSON.stringify(newSortBy)
      ) {
        setFilters((prev) => ({
          ...prev,
          automaticCarWash: newAutomaticCarWash,
          selfServiceCarWash: newSelfServiceCarWash,
          sortBy: newSortBy,
        }));
      }
    }
    // Remove setFilters from dependencies array since it's stable
  }, [searchParams]);

  const handleMapReady = (map: maplibregl.Map) => (mapRef.current = map);

  const scrollToCard = (carWashId: string) => {
    const cardElement = cardRefs.current.get(carWashId);
    if (cardElement && scrollAreaRef.current) {
      cardElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const handleOpenAbout = (selectedCarWash: CarWashResponse) => {
    setSelectedCarWash(selectedCarWash);
    setOpenAbout(true);
    handleNavigateToLocation({
      lat: selectedCarWash.location.coordinates[1],
      lng: selectedCarWash.location.coordinates[0],
    });
    scrollToCard(String(selectedCarWash.id));
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

  const handleSearchArea = (
    center: { longitude: number; latitude: number },
    radius: number
  ) => {
    setFilters({
      ...filters,
      distance: Number(Math.ceil(radius / 2)),
      userLat: center.latitude,
      userLng: center.longitude,
    });
  };
  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen">
        <Topbar
          filters={filters}
          setFilters={setFilters}
          locationData={locationData}
        />
        <SearchAndFilterBar
          filters={filters}
          setFilters={setFilters}
          showMap={showMap}
          setShowMap={setShowMap}
          currentLocation={currentLocation}
          setAddress={setAddress}
        />
        <div className="flex flex-1 overflow-hidden bg-neutral-100 relative md:flex-row flex-col">
          <div className="w-[550px] relative bg-white hidden md:flex flex-col">
            <div className="flex justify-end py-2 px-4">
              <SortBySelect filters={filters} setFilters={setFilters} />
            </div>
            <ScrollArea ref={scrollAreaRef} className="w-full flex-1 px-2">
              <div className="flex flex-col gap-2 pr-4">
                {(isLoading || !locationData) && (
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
                    <div
                      key={carWash.id}
                      ref={(el) => {
                        if (el) cardRefs.current.set(String(carWash.id), el);
                      }}
                    >
                      <CarWashCard
                        data={carWash}
                        onClick={() => handleOpenAbout(carWash)}
                        isSelected={selectedCarWash?.id === carWash.id}
                      />
                    </div>
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
              loading={locationData === null}
              presentCenter={{
                longitude: filters.userLng,
                latitude: filters.userLat,
              }}
              showMap={showMap}
              publishableKey={RADAR_KEY || ""}
              carWashes={carWashes}
              onMapReady={handleMapReady}
              onSearchArea={handleSearchArea}
              onMarkerClick={handleOpenAbout}
            />
          </div>
          <div className="md:hidden h-[300px]"></div>
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
