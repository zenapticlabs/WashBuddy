import { add } from "date-fns";
import { useState, useCallback } from "react";

interface LocationData {
  address: string;
  city: string;
  state: string;
  state_code: string;
  postal_code: string;
  country: string;
  country_code: string;
  formatted_address: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
}

const useLocationData = () => {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchLocationData = useCallback(() => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const response = await fetch(
              `https://api.radar.io/v1/geocode/reverse?coordinates=${latitude},${longitude}`,
              {
                headers: {
                  Authorization: process.env.NEXT_PUBLIC_RADAR_API_KEY || "",
                },
              }
            );

            if (!response.ok) {
              throw new Error("Failed to fetch location data");
            }

            const data = await response.json();
            const address = data.addresses[0]; // Assuming the API returns an array of addresses
            setLocationData({
              address: address.addressLabel,
              city: address.city,
              state: address.state,
              state_code: address.stateCode,
              postal_code: address.postalCode,
              country: address.country,
              country_code: address.countryCode,
              formatted_address: address.formattedAddress,
              location: {
                type: "Point",
                coordinates: [longitude, latitude],
              },
            });

            setError(null);
          } catch (err) {
            setError("Failed to fetch location data. Please try again.");
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          setError("Failed to detect location. Please try again.");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  }, []);

  return { locationData, error, loading, fetchLocationData };
};

export default useLocationData;
