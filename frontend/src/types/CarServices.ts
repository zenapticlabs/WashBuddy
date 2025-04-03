export interface CarServiceAmenity {
  id: string;
  name: string;
  category: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CarServiceWashType {
  id: string;
  category: string;
  name: string;
  subclass: string;
  description?: string;
  status: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface ICarServiceWashPackage {
  id: string;
  name: string;
  wash_types: CarServiceWashType[];
  amenities: CarServiceAmenity[];
  status: string;
  description?: string;
  price: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ICarWashCard {
  id: string;
  name: string;
  address: string;
  howFarAway: number;
  price: number;
  rating: number;
  reviewsCount: number;
  washType: string;
  image: string;
  promotion?: string;
  location: {
    lat: number;
    lng: number;
  };
}

export interface OperatingHour {
  id: number;
  created_at: string;
  updated_at: string;
  status: string;
  day_of_week: number;
  is_closed: boolean;
  opening_time: string;
  closing_time: string;
  created_by: string | null;
  updated_by: string | null;
  car_wash: number;
}

export interface CarWashPackage {
  id: number;
  name: string;
  price: number;
  washTypes: number[];
}

export interface CarWashImage {
  id: number;
  created_at: string;
  updated_at: string;
  status: string;
  image_type: string;
  image_url: string;
  created_by: string | null;
  updated_by: string | null;
  car_wash: number;
}

export interface ReviewsSummary {
  total_reviews: number;
  average_rating: number;
  rating_5: number;
  rating_4: number;
  rating_3: number;
  rating_2: number;
  rating_1: number;
}

export interface CarWashResponse {
  id: number;
  wash_types: string[];
  amenities: string[];
  location: {
    type: string;
    coordinates: [number, number];
  };
  operating_hours: OperatingHour[];
  packages: CarWashPackage[];
  images: CarWashImage[];
  distance: number;
  reviews_summary: ReviewsSummary;
  created_at: string;
  updated_at: string;
  status: string;
  car_wash_name: string;
  street: string;
  city: string;
  state: string;
  state_code: string | null;
  postal_code: string;
  country: string;
  country_code: string;
  formatted_address: string;
  phone: string | null;
  website: string | null;
  email: string | null;
  image_url: string;
  reviews_count: number;
  reviews_average: string;
  automatic_car_wash: boolean;
  self_service_car_wash: boolean;
  open_24_hours: boolean;
  verified: boolean;
  created_by: string | null;
  updated_by: string | null;
}

export interface ICarWashPurchaseHistory {
  id: string;
  carWashName: string;
  location: string;
  purchaseDate: string;
  washCode: string;
}
