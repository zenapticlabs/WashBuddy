export interface FilterState {
  distanceRange: number;
  amenities: string[];
  washType: string[];
  ratings: number[];
  priceRange: number;
  operatingHours: string[];
}

export interface FilterPanelProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onApplyFilters?: (filters: FilterState) => void;
}
