export * from "./CarServices";
export * from "./filters";
export * from "./Review";

export interface Amenity {
  id: string;
  name: string;
  category: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

export interface WashType {
  id: string;
  cagetory: string;
  name: string;
  subclass: string;
}

