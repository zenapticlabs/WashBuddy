export interface FilterState {
  carWashType: string;
  searchKey: string;
  distance: number;
  amenities: string[];
  washType: string[];
  ratings: number[];
  priceRange: number;
  operatingHours: string[];
  sortBy: string;
  // latitude: number;
  // longitude: number;
  pagination: boolean;
  pageSize: number;
  userLat: number;
  userLng: number;
}

