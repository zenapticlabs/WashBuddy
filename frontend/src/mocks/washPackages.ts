import { ICarServiceWashPackage } from "@/types";

export const MockWashPackages: ICarServiceWashPackage[] = [
  {
    id: "1",
    name: "Wash Package 1",
    price: 10,
    discount: 5,
    description: "Basic wash with soap and water",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "2",
    name: "Wash Package 2",
    price: 20,
    description: "Basic wash with soap and water",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "3",
    name: "Wash Package 3",
    price: 20,
    description: "Waxing and polishing",
    created_at: new Date(),
    updated_at: new Date(),
  },
];
