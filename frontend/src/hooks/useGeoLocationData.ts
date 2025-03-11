import { useState, useCallback } from "react";

interface LocationData {
  latitude: number;
  longitude: number;
}

const useGeoLocationData = () => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchLocationData = useCallback(() => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLatitude(latitude);
          setLongitude(longitude);
          setError(null);
          setLoading(false);
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

  return { latitude, longitude, error, loading, fetchLocationData };
};

export default useGeoLocationData;