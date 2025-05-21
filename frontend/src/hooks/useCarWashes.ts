import { useEffect, useState } from 'react';
import { getCarwashes } from "@/services/CarwashService";
import { getOffers } from '@/services/OfferService';
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
  const [hiddenOffer, setHiddenOffer] = useState<ICarOffer | null>(null);
  const [offers, setOffers] = useState<ICarOffer[]>([]);
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
      const currentTimeUTC = now.toISOString().substring(11, 16); // Get current time in UTC "HH:mm" format
      // Offer times are already in UTC format, just take HH:mm part
      const startTime = offer.start_time.substring(0, 5); // "HH:mm"
      const endTime = offer.end_time.substring(0, 5); // "HH:mm"
      return currentTimeUTC >= startTime && currentTimeUTC <= endTime;
    }
    return offer.offer_type === 'ONE_TIME';
  };

  const getLowestPricePackage = (packages: ExtendedCarWashPackage[]) => {
    let lowestPack: ExtendedCarWashPackage | null = null;
    let lowestPriceValue = Number.MAX_VALUE;
    
    packages.forEach(pack => {
      // Check package base price
      const packagePrice: number = Number(pack.price);

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
      // Fetch car washes
      const carWashResult = await getCarwashes(filters);
      let modifiedCarWashes = carWashResult.data[0].results as ExtendedCarWash[];

      // Fetch offers
      const offerResult = await getOffers(filters.userLat, filters.userLng);
      setOffers(offerResult.data);
      
      // Match offers with packages
      modifiedCarWashes = modifiedCarWashes.map(carWash => ({
        ...carWash,
        packages: carWash.packages.map(pkg => {
          const matchingOffer = offerResult.data.find(
            (offer: ICarOffer) => 
              offer.package_id === pkg.id && 
              offer.car_wash_id === carWash.id
          );
          return {
            ...pkg,
            offer: matchingOffer || undefined
          };
        })
      }));

      // Add lowestPack to each car wash
      modifiedCarWashes = modifiedCarWashes.map((carWash) => ({
        ...carWash,
        lowestPack: getLowestPricePackage(carWash.packages)
      }));

      setCarWashes(modifiedCarWashes);
      setCount(carWashResult.data[0].count);
      setTotalPages(carWashResult.data[0].links.totalPages);
      setCurrentPage(carWashResult.data[0].links.currentPage);

      // Filter and sort hidden offers
      const hOffers = offerResult.data.filter((offer: ICarOffer) => {
        return offer.offer_type === "GEOGRAPHICAL" && parseFloat(offer.radius_miles) <= 5;
      });

      const sortedOffers = hOffers.sort((a: ICarOffer, b: ICarOffer) => {
        const priceComparison = parseFloat(a.offer_price) - parseFloat(b.offer_price);
        if (priceComparison === 0) {
          return parseFloat(a.radius_miles) - parseFloat(b.radius_miles);
        }
        return priceComparison;
      });

      setHiddenOffer(sortedOffers[0] || null);
    }
    setIsLoading(false);
  };

  return { carWashes, hiddenOffer, offers, isLoading, count, totalPages, currentPage };
} 
