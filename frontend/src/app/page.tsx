"use client";

import { CarWashCard } from "@/components/organism/carWashCard";
import { mockCarWashes } from "@/mocks/carWashes";
import SearchBar from "@/components/molecule/SearchBar";
import { useState, useRef, useEffect } from "react";
import FilterComponent from "@/components/pages/main/filter/FilterComponent";
import { FilterState } from "@/types/filters";
import { RadarMap } from "@/components/organism/RadarMap";
import Image from "next/image";
import logo from "@/assets/logo.png";
import { Bell, MapPin, MenuIcon, Plus } from "lucide-react";
import { Car_Wash_Type } from "@/utils/constants";
import user from "@/assets/user.png";
import AutomaticIcon from "@/assets/icons/automatic.svg";
import SelfServiceIcon from "@/assets/icons/self-service.svg";
import { Button } from "@/components/ui/button";

import CreateCarWashDiaolog from "@/components/pages/main/CreateCarWashDiaolog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ICarWashCard } from "@/types";
import CarWashDetail from "@/components/pages/main/about/CarWashDetail";
import type maplibregl from "maplibre-gl";
import { getCarwashes } from "@/services/CarwashService";

const FilterButtonConfigs = [
  {
    icon: AutomaticIcon,
    key: Car_Wash_Type.AUTOMATIC,
    label: Car_Wash_Type.AUTOMATIC,
  },
  {
    icon: SelfServiceIcon,
    key: Car_Wash_Type.SELF_SERVICE,
    label: Car_Wash_Type.SELF_SERVICE,
  },
];

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

export default function Home() {
  const RADAR_KEY = process.env.NEXT_PUBLIC_RADAR_API_KEY;
  const [selectedCarWash, setSelectedCarWash] = useState<ICarWashCard | null>(
    null
  );
  const [openCreateModal, setOpenCreateModal] = useState(false);
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
  const mapRef = useRef<maplibregl.Map | null>(null);
  const notiCount = 2;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFilters(getFiltersFromParams(params));
  }, []);

  useEffect(() => {
    const fetchCarWashes = async () => {
      await getCarwashes(filters);
    };
    fetchCarWashes();
  }, [filters]);

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
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setFilters(getFiltersFromParams(params));
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const handleSearch = (search: string) => {
    setFilters({
      ...filters,
      searchKey: search,
    });
  };
  const handleOpenCreateModal = () => setOpenCreateModal(true);
  const handleMapReady = (map: maplibregl.Map) => (mapRef.current = map);

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
    <div className="flex flex-col p-4 h-screen">
      <div className="flex gap-2 py-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full cursor-pointer" onClick={() => {}}>
            <MenuIcon size={24} className="text-neutral-900" />
          </div>
          <Image src={logo} alt="logo" width={42} height={42} color="#ff0000" />
          <span className="text-headline-4 font-bold pl-1">WashBuddy</span>
          {FilterButtonConfigs.map((config) => (
            <Button
              variant="outline"
              key={config.key}
              onClick={() => setFilters({ ...filters, carWashType: config.key })}
              className={`rounded-full shadow-none ${
                filters.carWashType === config.key
                  ? "border-blue-500"
                  : "border-neutral-100"
              }`}
            >
              <Image
                src={config.icon}
                alt={config.label}
                width={24}
                height={24}
              />
              <span className="text-title-2 text-neutral-900">
                {config.label}
              </span>
            </Button>
          ))}
          <span className="text-title-2 text-neutral-700 flex items-center gap-2">
            <MapPin size={24} />
            Downtown, NY
          </span>
        </div>
        <div className="flex items-center gap-6 pr-2">
          <Button
            variant="ghost"
            className="rounded-full shadow-none text-title-2 text-blue-500 hover:text-blue-500"
            onClick={handleOpenCreateModal}
          >
            <Plus size={24} />
            Add a WashNearby
          </Button>
          <CreateCarWashDiaolog
            open={openCreateModal}
            onOpenChange={setOpenCreateModal}
          />
          <div className="relative">
            <Bell size={24} className="text-neutral-900" />
            {notiCount > 0 && (
              <span className="bg-[#FF6464] border border-white text-title-2 text-white absolute -top-2 -right-1.5 rounded-full w-5 h-5 flex items-center justify-center z-10">
                {notiCount}
              </span>
            )}
          </div>
          <Image
            src={user}
            alt="user"
            width={32}
            height={32}
            className="rounded-full"
          />
        </div>
      </div>
      <SearchBar onChange={handleSearch} />
      <FilterComponent filters={filters} setFilters={setFilters} />
      <div className="flex flex-1 overflow-hidden bg-neutral-100">
        <div className="w-[550px] relative bg-white">
          <ScrollArea className="w-full h-full">
            <div className="flex flex-col gap-2 pr-4">
              {mockCarWashes.map((carWash) => (
                <CarWashCard
                  key={carWash.id}
                  data={carWash}
                  onClick={() => {
                    console.log("clicked", carWash);
                    setSelectedCarWash(carWash);
                  }}
                />
              ))}
            </div>
          </ScrollArea>
          {selectedCarWash && (
            <div className="absolute top-2 left-[560px] text-black z-10 h-full pb-4 ">
              <ScrollArea className="w-full h-full rounded-xl overflow-hidden">
                <CarWashDetail
                  data={selectedCarWash}
                  onClose={() => setSelectedCarWash(null)}
                  onNavigate={handleNavigateToLocation}
                />
              </ScrollArea>
            </div>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <RadarMap
            publishableKey={RADAR_KEY || ""}
            carWashes={mockCarWashes}
            onMapReady={handleMapReady}
          />
        </div>
      </div>
    </div>
  );
}
