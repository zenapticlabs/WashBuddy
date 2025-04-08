import { useEffect, useState } from 'react';
import { getCarwashes } from "@/services/CarwashService";
import { FilterState } from "@/types/filters";
import { CarWashResponse } from "@/types/CarServices";

export function useCarWashes(filters: FilterState) {
  const [carWashes, setCarWashes] = useState<CarWashResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setIsLoading(true);
    if (filters.userLat != 0 && filters.userLng != 0) {
      const result = await getCarwashes(filters);
      setCarWashes(result.data[0].results);
      setCount(result.data[0].count);
      setTotalPages(result.data[0].links.totalPages);
      setCurrentPage(result.data[0].links.currentPage);
    }
    setIsLoading(false);
  };

  return { carWashes, isLoading, count, totalPages, currentPage };
} 
