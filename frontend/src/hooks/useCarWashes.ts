import { useEffect, useState } from 'react';
import { getCarwashes } from "@/services/CarwashService";
import { FilterState } from "@/types/filters";
import { CarWashResponse } from "@/types/CarServices";
import useLocationData from './useLocationData';

export function useCarWashes(filters: FilterState) {
  const [carWashes, setCarWashes] = useState<CarWashResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // const { locationData, fetchLocationData } = useLocationData();

  useEffect(() => {
    fetchData();
  }, [filters]);


  const fetchData = async () => {
    setIsLoading(true);
    if (filters.userLat != 0 && filters.userLng != 0) {
      const result = await getCarwashes(filters);
      setCarWashes(result.data[0].results);
    }
    setIsLoading(false);
  };

  return { carWashes, isLoading };

} 