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
}

export interface ICarServiceWashPackage {
  id: string;
  name: string;
  price: number;
  discount?: number;
  description?: string;
  created_at: Date;
  updated_at: Date;
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

export interface CarWashResponse {
  id: number;
  wash_types: string[];
  amenities: string[];
  operating_hours: any[];
  packages: any[];
  images: any[];
  distance: number;
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
  reviews_count: number;
  reviews_average: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  automatic_car_wash: boolean;
  self_service_car_wash: boolean;
  open_24_hours: boolean;
  verified: boolean;
  created_at: string;
  updated_at: string;
  image_url: string;
}

export interface ICarWashPurchaseHistory {
  id: string;
  carWashName: string;
  location: string;
  purchaseDate: string;
  washCode: string;
}
