import { useEffect, useState } from 'react';
import { getCarwashes } from "@/services/CarwashService";
import { FilterState } from "@/types/filters";
import { ICarOffer } from "@/types/CarServices";
import { getOffers } from '@/services/OfferService';

export function useOffers(filters: FilterState) {
  const [offers, setOffers] = useState<ICarOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    fetchData();
  }, [filters.userLat, filters.userLng]);

  const fetchData = async () => {
    setIsLoading(true);
    if (filters.userLat != 0 && filters.userLng != 0) {
      const result = await getOffers(filters.userLat, filters.userLng);
      setOffers(result.data);
    }
    setIsLoading(false);
  };

  return { offers, isLoading };
} 
