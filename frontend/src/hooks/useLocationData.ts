import { useState, useCallback, useRef } from "react";

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

const MAX_RETRIES = 3;
const TIMEOUT_DURATION = 10000; // 10 seconds

const useLocationData = () => {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const retryCountRef = useRef(0);

  const fetchLocationFromCoordinates = useCallback(async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.radar.io/v1/geocode/reverse?coordinates=${lat},${lng}`,
        {
          headers: {
            Authorization: process.env.NEXT_PUBLIC_RADAR_API_KEY || "",
          },
        }
      );
      const data = await response.json();

      if (!data.addresses || !data.addresses[0]) {
        throw new Error("No address data found");
      }

      const address = data.addresses[0];
      const locationData = {
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
          coordinates: [lng, lat],
        },
      };

      return locationData;
    } catch (err) {
      console.error("Error fetching location from coordinates:", err);
      throw err;
    }
  }, []);

  const fetchLocationData = useCallback(async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          const geolocationOptions: PositionOptions = {
            enableHighAccuracy: true,
            timeout: TIMEOUT_DURATION,
            maximumAge: 0,
          };

          navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos),
            (err) => reject(err),
            geolocationOptions
          );
        }
      );

      const { latitude, longitude } = position.coords;

      const response = await fetch(
        `https://api.radar.io/v1/geocode/reverse?coordinates=${latitude},${longitude}`,
        {
          headers: {
            Authorization: process.env.NEXT_PUBLIC_RADAR_API_KEY || "",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Radar API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.addresses || !data.addresses[0]) {
        throw new Error("No address data found");
      }

      const address = data.addresses[0];
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

      retryCountRef.current = 0;
      setError(null);
    } catch (err) {
      console.error("Location error:", err);

      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current += 1;
        setError(`Retrying... Attempt ${retryCountRef.current} of ${MAX_RETRIES}`);
        // Retry after a short delay
        setTimeout(() => {
          fetchLocationData();
        }, 1000);
      } else {
        let errorMessage = "";

        if (err instanceof GeolocationPositionError) {
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage +=
                "Please enable location permissions in your browser.";
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage += "Location information is unavailable.";
              break;
            case err.TIMEOUT:
              errorMessage += "Location request timed out.";
              break;
            default:
              errorMessage += "Please try again.";
          }
        } else {
          errorMessage +=
            "Please check your internet connection and try again.";
        }

        setError(errorMessage);
        retryCountRef.current = 0;
      }
    } finally {
      if (retryCountRef.current >= MAX_RETRIES) {
        setLoading(false);
      }
    }
  }, []);

  return {
    locationData,
    error,
    loading,
    fetchLocationData,
    fetchLocationFromCoordinates
  };
};

export default useLocationData;
