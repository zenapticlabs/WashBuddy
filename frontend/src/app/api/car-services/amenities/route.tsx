import { CarServiceAmenity } from "@/types";
import { NextResponse } from "next/server";

const filterTypes: CarServiceAmenity[] = [
  // Amenities
  {
    id: "1",
    service_name: "Free vacuums",
    description: "Free vacuums",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "2",
    service_name: "Air gun",
    description: "Air gun",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "3",
    service_name: "Mat wash station",
    description: "Mat wash station",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "4",
    service_name: "Open 24 hours",
    description: "Open 24 hours",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "5",
    service_name: "Free tire air station",
    description: "Free tire air station",
    created_at: new Date(),
    updated_at: new Date(),
  },
];

export async function GET() {
  return NextResponse.json(filterTypes);
}
