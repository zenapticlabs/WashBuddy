import { useState, useEffect } from 'react';
import { CarServiceAmenity } from '@/types';
import { getAmenities } from '@/services/AmenityService';

export function useAmenities() {
  const [amenities, setAmenities] = useState<CarServiceAmenity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        setIsLoading(true);
        const data = await getAmenities();
        setAmenities(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch amenities'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAmenities();
  }, []);

  return { amenities, isLoading, error };
} 