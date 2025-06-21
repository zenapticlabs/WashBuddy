import { useEffect, useState } from 'react';
import { FilterState } from "@/types/filters";
import { ICarOffer } from "@/types/CarServices";
import { getOffers } from '@/services/OfferService';

export function useHiddenOffer(filters: FilterState) {
  const [hiddenOffer, setHiddenOffer] = useState<ICarOffer | null>(null);
  const [offers, setOffers] = useState<ICarOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    fetchData();
  }, [filters.userLat, filters.userLng, filters.distance]);

  const fetchData = async () => {
    setIsLoading(true);
    const hOffers = await getOffers(filters.userLat, filters.userLng);
    setOffers(hOffers);
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
    setIsLoading(false);
  }

  return { hiddenOffer, isLoading, offers };
} 
