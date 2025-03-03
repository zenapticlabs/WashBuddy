export * from "./CarServices";
export * from "./filters";
export * from "./Review";

export interface Amenity {
  id: string;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

export interface WashType {
  id: string;
  service_type: string;
  service_name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

