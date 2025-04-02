export interface CarwashFormData {
  car_wash_name?: string;
  phone: string;
  website?: string;
  email?: string;
  operating_hours: Array<{
    day_of_week: number;
    is_closed: boolean;
    opening_time: string;
    closing_time: string;
  }>;
  images: Array<{
    image_type: string;
    image_url: string;
  }>;
  wash_types: any[];
  amenities: any[];
  reviews_count: number;
  reviews_average: number;
  open_24_hours: boolean;
  verified: boolean;
  automatic_car_wash?: boolean;
  self_service_car_wash?: boolean;
  image_url?: string;
  formatted_address?: string;
} 