export interface FilterState {
  automaticCarWash: boolean;
  selfServiceCarWash: boolean;
  distance: number;
  amenityName: string[];
  washTypeName: string[];
  ratings: number[];
  priceRange: number;
  operatingHours: string[];
  sortBy: string[];
  // latitude: number;
  // longitude: number;
  pagination: boolean;
  page_size: number;
  userLat: number;
  userLng: number;
  page: number;
  offers: string[];
}

