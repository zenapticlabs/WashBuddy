import { useEffect, useRef } from "react";
import Radar from "radar-sdk-js";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { CarWashResponse } from "@/types/CarServices";
import { extractCoordinates } from "@/utils/functions";
interface RadarMapProps {
  publishableKey: string;
  userId?: string;
  carWashes?: CarWashResponse[];
  onMapReady?: (map: maplibregl.Map) => void;
}

export function RadarMap({ publishableKey, userId, carWashes, onMapReady }: RadarMapProps) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const getLngLat = (location: [number, number]): [number, number] => {
    return [location[0], location[1]] as [number, number];
  }

  // Add fitToMarkers function
  const fitToMarkers = () => {
    if (!mapRef.current || !carWashes?.length) return;

    const bounds = new maplibregl.LngLatBounds();

    // Extend bounds to include all car wash locations
    carWashes.forEach((carWash) => {
      bounds.extend(getLngLat(carWash.location.coordinates));
    });

    // Fit the map to show all markers
    mapRef.current.fitBounds(bounds, {
      padding: { top: 50, bottom: 50, left: 50, right: 50 },
      maxZoom: 15,
      duration: 1000
    });
  };

  // Initialize map only once
  useEffect(() => {
    Radar.initialize(publishableKey);

    const map = new maplibregl.Map({
      container: "radar-map",
      style: `https://api.radar.io/maps/styles/radar-default-v1?publishableKey=${publishableKey}`,
      center: [-89.4012, 43.0731],
      zoom: 7,
    });

    // Add zoom controls
    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on("load", () => {
      onMapReady?.(map);
      // Fit to markers after map loads
      if (carWashes?.length) {
        fitToMarkers();
      }
    });

    if (userId) {
      Radar.setUserId(userId);
    }

    // Track user location
    Radar.trackOnce()
      .then((result) => {
        if (result.location) {
          const { latitude, longitude } = result.location;

          const userMarker = new maplibregl.Marker({
            color: "#2563eb",
          })
            .setLngLat([longitude, latitude])
            .setPopup(
              new maplibregl.Popup({ offset: 25 }).setHTML(
                '<div class="p-2"><strong>Your Location</strong></div>'
              )
            )
            .addTo(map);

          map.flyTo({
            center: [longitude, latitude],
            zoom: 12,
            essential: true,
          });
        }
      })
      .catch((err) => {
        console.error("Error tracking location:", err);
      });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [publishableKey, userId]); // Only depend on publishableKey and userId

  // Handle car wash markers in a separate effect
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current?.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    carWashes?.forEach((carWash: CarWashResponse) => {
      const customMarker = document.createElement("div");
      customMarker.innerHTML = `
        <div class="relative flex items-center justify-center ">
          <div class="absolute z-10 bottom-1 flex flex-col items-center">
            <div class="bg-accent-green rounded-full px-3 py-2 border-4 border-white flex items-center justify-center gap-1">
              <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.125 5.5C17.1253 5.44189 17.1174 5.38403 17.1016 5.32812L15.9805 1.40625C15.9051 1.14603 15.7476 0.917159 15.5315 0.753823C15.3153 0.590487 15.0522 0.501448 14.7812 0.5H3.21875C2.94784 0.501448 2.68467 0.590487 2.46853 0.753823C2.25239 0.917159 2.09488 1.14603 2.01953 1.40625L0.899219 5.32812C0.88308 5.38399 0.874926 5.44185 0.875001 5.5V6.75C0.875001 7.23514 0.987954 7.71362 1.20492 8.14754C1.42188 8.58147 1.73689 8.95892 2.125 9.25V14.875C2.125 15.0408 2.19085 15.1997 2.30806 15.3169C2.42527 15.4342 2.58424 15.5 2.75 15.5H15.25C15.4158 15.5 15.5747 15.4342 15.6919 15.3169C15.8092 15.1997 15.875 15.0408 15.875 14.875V9.25C16.2631 8.95892 16.5781 8.58147 16.7951 8.14754C17.012 7.71362 17.125 7.23514 17.125 6.75V5.5ZM3.21875 1.75H14.7812L15.6734 4.875H2.32891L3.21875 1.75ZM7.125 6.125H10.875V6.75C10.875 7.24728 10.6775 7.72419 10.3258 8.07583C9.9742 8.42746 9.49728 8.625 9 8.625C8.50272 8.625 8.02581 8.42746 7.67418 8.07583C7.32254 7.72419 7.125 7.24728 7.125 6.75V6.125Z" fill="white"/>
              </svg>
              <span class="text-white text-title-2">$12</span>
            </div>
            <div class="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white -mt-[1px]"></div>
          </div>
          <div class="w-[20px] h-[6px] bg-neutral-700 rounded-full blur-sm transform"></div>
        </div>
      `;

      const marker = new maplibregl.Marker({
        element: customMarker,
        anchor: "bottom",
      })
        .setLngLat(getLngLat(carWash.location.coordinates))
        .setPopup(
          new maplibregl.Popup({
            offset: 25,
            className: "custom-popup",
          }).setHTML(`
            <div class="p-3">
              <h3 class="font-bold text-lg mb-2">${carWash.car_wash_name}</h3>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-yellow-500">⭐</span>
              </div>
            </div>
          `)
        )
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });

    // Fit to markers after adding them
    if (carWashes?.length) {
      fitToMarkers();
    }
  }, [carWashes]);

  return (
    <div
      id="radar-map"
      className="w-full h-full min-h-[400px] rounded-lg overflow-hidden"
    />
  );
}
