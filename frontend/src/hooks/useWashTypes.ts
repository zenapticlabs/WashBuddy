import { useState, useEffect } from 'react';
import { CarServiceAmenity, CarServiceWashType } from '@/types';
import { getAmenities } from '@/services/AmenityService';
import { getWashTypes } from '@/services/WashType';

export function useWashTypes() {
  const [washTypes, setWashTypes] = useState<CarServiceWashType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchWashTypes = async () => {
      try {
        setIsLoading(true);
        const data = await getWashTypes();
        setWashTypes(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch wash types'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchWashTypes();
  }, []);

  return { washTypes, isLoading, error };
} 