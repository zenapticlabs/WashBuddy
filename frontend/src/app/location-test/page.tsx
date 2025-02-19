"use client";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useReverseGeocode } from "@/hooks/useReverseGeocode";

export default function Home() {
  const {
    latitude,
    longitude,
    error: geoError,
    loading: geoLoading,
  } = useGeolocation();
  const {
    country,
    state,
    zipCode,
    formattedAddress,
    loading: addressLoading,
    error: addressError,
  } = useReverseGeocode(latitude, longitude);

  return (
    <div className="w-full h-screen flex flex-col gap-4 items-center justify-center">
      {geoLoading && <p>Loading location...</p>}
      {geoError && <p className="text-red-500">Error: {geoError}</p>}

      {addressLoading && <p>Loading address details...</p>}
      {addressError && <p className="text-red-500">Error: {addressError}</p>}

      {latitude && longitude && (
        <div className="mb-4 space-y-2">
          <p>Latitude: {latitude}</p>
          <p>Longitude: {longitude}</p>
          {formattedAddress && <p>Full Address: {formattedAddress}</p>}
        </div>
      )}
    </div>
  );
}
