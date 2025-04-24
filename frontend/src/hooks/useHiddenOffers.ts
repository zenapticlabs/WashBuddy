import { useEffect, useState } from 'react';
import { getCarwashes } from "@/services/CarwashService";
import { FilterState } from "@/types/filters";
import { ICarOffer } from "@/types/CarServices";
import { getOffers } from '@/services/OfferService';

export function useHiddenOffers(filters: FilterState) {
  const [hiddenOffers, setHiddenOffers] = useState<ICarOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    fetchData();
  }, [filters.userLat, filters.userLng]);

  const fetchData = async () => {
    setIsLoading(true);
    if (filters.userLat != 0 && filters.userLng != 0) {
      const result = await getOffers(filters.userLat, filters.userLng);
      const hOffers = result.data.filter((offer: ICarOffer) => offer.offer_type == "GEOGRAPHICAL" && parseFloat(offer.radius_miles) <= filters.distance);
      setHiddenOffers(hOffers);
    }
    setIsLoading(false);
  };

  return { hiddenOffers, isLoading };
} 
