import { useEffect } from "react";
import Radar from "radar-sdk-js";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { AsyncCallbackSet } from "next/dist/server/lib/async-callback-set";

interface RadarMapProps {
  publishableKey: string;
  userId?: string;
  carWashes: Array<{
    id: string;
    name: string;
    location: {
      lat: number;
      lng: number;
    };
    price: number;
    rating: number;
  }>;
}

export function RadarMap({ publishableKey, userId, carWashes }: RadarMapProps) {
  useEffect(() => {
    // Initialize Radar with your publishable key
    Radar.initialize(publishableKey);

    // Initialize the map
    const map = new maplibregl.Map({
      container: "radar-map",
      style: `https://api.radar.io/maps/styles/radar-default-v1?publishableKey=${publishableKey}`,
      center: [-89.4012, 43.0731], // Center on Wisconsin
      zoom: 7,
    });

    // If you have a user ID, you can identify the user
    if (userId) {
      Radar.setUserId(userId);
    }

    // Add car wash markers once the map is loaded
    map.on("load", () => {
      carWashes.forEach((carWash) => {
        // Method 1: Custom HTML Element with Tailwind
        const el = document.createElement("div");
        el.className =
          "flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg cursor-pointer transform transition-transform hover:scale-110";
        el.innerHTML = `
          <div class="flex flex-col items-center">
            <span class="text-blue-600 font-bold">$${carWash.price}</span>
          </div>
        `;

        // Method 2: SVG Marker
        const svgMarker = document.createElement("div");
        svgMarker.innerHTML = `
          <svg viewBox="0 0 24 24" width="36" height="36">
            <path 
              fill="#2563eb" 
              d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"
            />
            <text 
              x="12" 
              y="8" 
              text-anchor="middle" 
              fill="white" 
              font-size="6"
            >
              $${carWash.price}
            </text>
          </svg>
        `;

        // Method 3: Custom styled div with price badge
        const customMarker = document.createElement("div");
        customMarker.innerHTML = `
          <div class="relative flex items-center justify-center ">
            <div class="absolute z-10 bottom-1 flex flex-col items-center">
              <div class="bg-accent-green rounded-full px-3 py-2 border-4 border-white flex items-center justify-center gap-1">
                <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.125 5.5C17.1253 5.44189 17.1174 5.38403 17.1016 5.32812L15.9805 1.40625C15.9051 1.14603 15.7476 0.917159 15.5315 0.753823C15.3153 0.590487 15.0522 0.501448 14.7812 0.5H3.21875C2.94784 0.501448 2.68467 0.590487 2.46853 0.753823C2.25239 0.917159 2.09488 1.14603 2.01953 1.40625L0.899219 5.32812C0.88308 5.38399 0.874926 5.44185 0.875001 5.5V6.75C0.875001 7.23514 0.987954 7.71362 1.20492 8.14754C1.42188 8.58147 1.73689 8.95892 2.125 9.25V14.875C2.125 15.0408 2.19085 15.1997 2.30806 15.3169C2.42527 15.4342 2.58424 15.5 2.75 15.5H15.25C15.4158 15.5 15.5747 15.4342 15.6919 15.3169C15.8092 15.1997 15.875 15.0408 15.875 14.875V9.25C16.2631 8.95892 16.5781 8.58147 16.7951 8.14754C17.012 7.71362 17.125 7.23514 17.125 6.75V5.5ZM3.21875 1.75H14.7812L15.6734 4.875H2.32891L3.21875 1.75ZM7.125 6.125H10.875V6.75C10.875 7.24728 10.6775 7.72419 10.3258 8.07583C9.9742 8.42746 9.49728 8.625 9 8.625C8.50272 8.625 8.02581 8.42746 7.67418 8.07583C7.32254 7.72419 7.125 7.24728 7.125 6.75V6.125ZM5.875 6.125V6.75C5.87489 7.07243 5.79163 7.38938 5.63327 7.67023C5.47492 7.95109 5.24681 8.18637 4.97099 8.35334C4.69516 8.52031 4.38094 8.61333 4.05867 8.62342C3.7364 8.63351 3.41698 8.56033 3.13125 8.41094C3.08777 8.37709 3.03995 8.34924 2.98906 8.32812C2.72428 8.15861 2.50637 7.92524 2.35538 7.64947C2.20439 7.3737 2.12517 7.0644 2.125 6.75V6.125H5.875ZM14.625 14.25H3.375V9.8125C3.58075 9.85398 3.79011 9.87491 4 9.875C4.48514 9.875 4.96362 9.76205 5.39754 9.54508C5.83147 9.32812 6.20892 9.01311 6.5 8.625C6.79109 9.01311 7.16854 9.32812 7.60246 9.54508C8.03638 9.76205 8.51486 9.875 9 9.875C9.48514 9.875 9.96362 9.76205 10.3975 9.54508C10.8315 9.32812 11.2089 9.01311 11.5 8.625C11.7911 9.01311 12.1685 9.32812 12.6025 9.54508C13.0364 9.76205 13.5149 9.875 14 9.875C14.2099 9.87491 14.4192 9.85398 14.625 9.8125V14.25ZM15.0102 8.32812C14.9599 8.34928 14.9127 8.37686 14.8695 8.41016C14.5838 8.5597 14.2644 8.63304 13.9421 8.62307C13.6198 8.61311 13.3055 8.5202 13.0296 8.35329C12.7536 8.18639 12.5254 7.95115 12.367 7.6703C12.2085 7.38944 12.1252 7.07247 12.125 6.75V6.125H15.875V6.75C15.8747 7.06447 15.7954 7.37382 15.6443 7.6496C15.4931 7.92537 15.2751 8.1587 15.0102 8.32812Z" fill="white"/>
                </svg>
                <span class="text-white text-title-2">$${carWash.price}</span>
              </div>
              <div class="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white -mt-[1px]"></div>
            </div>
            <div class="w-[20px] h-[6px] bg-neutral-700 rounded-full blur-sm transform"></div>
          </div>
        `;

        // Choose one of the above markers and use it:
        new maplibregl.Marker({
          element: customMarker, // or el, or svgMarker
          anchor: "bottom", // 'bottom', 'top', 'left', 'right', 'center', 'top-left', etc.
        })
          .setLngLat([carWash.location.lng, carWash.location.lat])
          .setPopup(
            new maplibregl.Popup({
              offset: 25,
              className: "custom-popup", // Add this class for custom popup styling
            }).setHTML(`
              <div class="p-3">
                <h3 class="font-bold text-lg mb-2">${carWash.name}</h3>
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-yellow-500">⭐</span>
                </div>
              </div>
            `)
          )
          .addTo(map);
      });
    });

    // Track user location
    Radar.trackOnce()
      .then((result) => {
        if (result.location) {
          const { latitude, longitude } = result.location;

          // Add user location marker
          const userMarker = new maplibregl.Marker({
            color: "#2563eb", // blue-600
          })
            .setLngLat([longitude, latitude])
            .setPopup(
              new maplibregl.Popup({ offset: 25 }).setHTML(
                '<div class="p-2"><strong>Your Location</strong></div>'
              )
            )
            .addTo(map);

          // Center map on user's location
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

    // Cleanup
    return () => {
      map.remove();
    };
  }, [publishableKey, userId, carWashes]);

  return (
    <div
      id="radar-map"
      className="w-full h-full min-h-[400px] rounded-lg overflow-hidden"
    />
  );
}
