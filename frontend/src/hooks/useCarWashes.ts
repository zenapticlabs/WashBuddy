import { useEffect, useState } from 'react';
import { getCarwashes } from "@/services/CarwashService";
import { FilterState } from "@/types/filters";
import { CarWashResponse, CarWashPackage, ICarOffer } from "@/types/CarServices";


interface ExtendedCarWashPackage extends CarWashPackage {
  offer?: ICarOffer;
  isOffer?: boolean;
  lowestPrice?: number;
  offerType?: string;
}

interface ExtendedCarWash extends Omit<CarWashResponse, 'packages'> {
  packages: ExtendedCarWashPackage[];
  lowestPack?: ExtendedCarWashPackage | null;
}

export function useCarWashes(filters: FilterState) {
  const [carWashes, setCarWashes] = useState<CarWashResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const isOfferValid = (offer: ICarOffer): boolean => {
    if (offer.offer_type === 'TIME_DEPENDENT') {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-US', { hour12: false });

      // Convert offer times to 24-hour format for comparison
      const startTime = offer.start_time.substring(0, 5); // "HH:mm"
      const endTime = offer.end_time.substring(0, 5); // "HH:mm"

      return currentTime >= startTime && currentTime <= endTime;
    }
    return offer.offer_type === 'ONE_TIME';
  };

  const getLowestPricePackage = (packages: ExtendedCarWashPackage[]) => {
    let lowestPack: ExtendedCarWashPackage | null = null;
    let lowestPriceValue = Number.MAX_VALUE;

    packages.forEach(pack => {
      // Check package base price
      const packagePrice = pack.price;
      if (packagePrice < lowestPriceValue) {
        lowestPriceValue = packagePrice;
        lowestPack = { ...pack, lowestPrice: packagePrice, isOffer: false };
      }

      // Check offer price if exists and is valid
      if (pack.offer && pack.offer.offer_type !== 'GEOGRAPHICAL' && isOfferValid(pack.offer)) {
        const offerPrice = parseFloat(pack.offer.offer_price);
        if (!isNaN(offerPrice) && offerPrice < lowestPriceValue) {
          lowestPriceValue = offerPrice;
          lowestPack = { ...pack, lowestPrice: offerPrice, offerType: pack.offer?.offer_type, isOffer: true };
        }
      }
    });

    return lowestPack;
  };

  const fetchData = async () => {
    setIsLoading(true);
    if (filters.userLat != 0 && filters.userLng != 0) {
      const result = await getCarwashes(filters);
      let modifiedCarWashes = result.data[0].results as ExtendedCarWash[];

      // Add lowestPack to each car wash
      modifiedCarWashes = modifiedCarWashes.map((carWash) => ({
        ...carWash,
        lowestPack: getLowestPricePackage(carWash.packages)
      }));

      setCarWashes(modifiedCarWashes);
      setCount(result.data[0].count);
      setTotalPages(result.data[0].links.totalPages);
      setCurrentPage(result.data[0].links.currentPage);
    }
    setIsLoading(false);
  };

  return { carWashes, isLoading, count, totalPages, currentPage };
} 
