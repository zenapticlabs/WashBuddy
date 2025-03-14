export interface FilterState {
  automaticCarWash: boolean;
  distance: number;
  amenities: string[];
  washType: string[];
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
}

