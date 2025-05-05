import { useEffect, useState } from 'react';
import { FilterState } from "@/types/filters";
import { ICarOffer } from "@/types/CarServices";
import { getOffers } from '@/services/OfferService';

export function useHiddenOffer(filters: FilterState) {
  const [hiddenOffer, setHiddenOffer] = useState<ICarOffer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    fetchData();
  }, [filters.userLat, filters.userLng]);

  const fetchData = async () => {
    setIsLoading(true);
    if (filters.userLat != 0 && filters.userLng != 0) {
      const result = await getOffers(filters.userLat, filters.userLng);
      const hOffers = result.data.filter((offer: ICarOffer) => offer.offer_type == "GEOGRAPHICAL" && parseFloat(offer.radius_miles) <= filters.distance);
      
      // Sort by price first, then by radius
      const sortedOffers = hOffers.sort((a: ICarOffer, b: ICarOffer) => {
        // First compare by price
        const priceComparison = parseFloat(a.offer_price) - parseFloat(b.offer_price);
        // If prices are equal, compare by radius
        if (priceComparison === 0) {
          return parseFloat(a.radius_miles) - parseFloat(b.radius_miles);
        }
        return priceComparison;
      });

      setHiddenOffer(sortedOffers[0]);
    }
    setIsLoading(false);
  };

  return { hiddenOffer, isLoading };
} 
