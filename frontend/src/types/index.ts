export * from "./CarServices";
export * from "./filters";
export * from "./Review";

export interface IAmenity {
  id: string;
  name: string;
  category: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

export interface WashType {
  id: string;
  category: string;
  name: string;
  subclass: string;
}

export interface IWashType {
  id: number;
  status: string;
  name: string;
  description?: string;
  category: string;
  subclass: string;
  created_by: string | null;
  updated_by: string | null;
}

