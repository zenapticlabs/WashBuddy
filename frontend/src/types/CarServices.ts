export interface CarServiceAmenity {
  id: string;
  service_name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CarServiceWashType {
  id: string;
  service_type: string;
  service_name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
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
