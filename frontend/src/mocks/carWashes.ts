import { ICarWashCard } from "@/types";

export const mockCarWashes: ICarWashCard[] = [
  {
    id: "1",
    image: "https://img.freepik.com/free-photo/professional-washer-blue-uniform-washing-luxury-car-with-water-gun-open-air-car-wash_496169-333.jpg",
    name: "Clean & Shine Car Wash",
    address: "123 State Street, Madison, WI",
    price: 3.85,
    howFarAway: 1.2,
    rating: 4.8,
    reviewsCount: 100,
    washType: "Basic Wash",
    promotion: "Special WashBuddy Price. Click to purchase wash",
    location: {
      lat: 43.0731,
      lng: -89.4012 // Downtown Madison
    }
  },
  {
    id: "2",
    image: "https://img.freepik.com/free-photo/worker-washing-car-with-sponge-car-service_1303-26923.jpg",
    name: "University Car Spa",
    address: "456 University Ave, Madison, WI",
    price: 5.99,
    howFarAway: 0.8,
    rating: 4.9,
    reviewsCount: 250,
    washType: "Premium Wash",
    promotion: "Student Discount - 20% Off",
    location: {
      lat: 43.0746,
      lng: -89.3933 // Near UW-Madison campus
    }
  },
  {
    id: "3",
    image: "https://img.freepik.com/free-photo/man-washing-his-car-garage_1157-26072.jpg",
    name: "East Side Express Wash",
    address: "789 East Washington Ave, Madison, WI",
    price: 2.99,
    howFarAway: 2.1,
    rating: 4.5,
    reviewsCount: 75,
    washType: "Express Wash",
    promotion: "Early Bird Special - Wash before 10AM",
    location: {
      lat: 43.0831,
      lng: -89.3789 // East Washington Area
    }
  },
  {
    id: "4",
    image: "https://img.freepik.com/free-photo/car-wash-service-concept_23-2149473369.jpg",
    name: "West Towne Auto Wash",
    address: "321 Gammon Road, Madison, WI",
    price: 8.99,
    howFarAway: 1.5,
    rating: 5.0,
    reviewsCount: 180,
    washType: "Deluxe Detail",
    promotion: "Free Interior Cleaning with Exterior Wash",
    location: {
      lat: 43.0551,
      lng: -89.5024 // West Towne Mall area
    }
  },
  {
    id: "5",
    image: "https://img.freepik.com/free-photo/man-washing-his-car-garage_1157-26099.jpg",
    name: "Hilldale Eco Wash",
    address: "567 Midvale Blvd, Madison, WI",
    price: 4.50,
    howFarAway: 1.8,
    rating: 4.7,
    reviewsCount: 150,
    washType: "Eco-Friendly Wash",
    promotion: "100% Eco-Friendly Products Used",
    location: {
      lat: 43.0667,
      lng: -89.4500 // Hilldale area
    }
  }
];