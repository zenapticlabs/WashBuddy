import { useEffect, useState } from 'react';
import { getCarwashes } from "@/services/CarwashService";
import { FilterState } from "@/types/filters";
import { ICarWashCard } from "@/types";
import { mockCarWashes } from "@/mocks/carWashes";

export function useCarWashes(filters: FilterState) {
  const [carWashes, setCarWashes] = useState<ICarWashCard[]>(mockCarWashes);

  useEffect(() => {
    const fetchCarWashes = async () => {
      const result = await getCarwashes(filters);
      // TODO: Update carWashes when API is ready
      // setCarWashes(result);
    };
    fetchCarWashes();
  }, [filters]);

  return { carWashes };
} 