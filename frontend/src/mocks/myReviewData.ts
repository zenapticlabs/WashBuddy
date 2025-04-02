import { IMyReview } from "@/types";

const reviews: IMyReview[] = [
  {
    id: "1",
    carWashName: "Clean & Shine Car Wash",
    carWashImage: "https://img.freepik.com/free-photo/professional-washer-blue-uniform-washing-luxury-car-with-water-gun-open-air-car-wash_496169-333.jpg",
    carWashAddress: "123 Main St, Downtown, NY",
    reviewRating: 4.5,
    photos: [
      "https://img.freepik.com/free-photo/professional-washer-blue-uniform-washing-luxury-car-with-water-gun-open-air-car-wash_496169-333.jpg",
      "https://img.freepik.com/free-photo/professional-washer-blue-uniform-washing-luxury-car-with-water-gun-open-air-car-wash_496169-333.jpg",
    ],
    createdAt: "2024-03-15",
    reviewText: "Excellent service! They did a thorough job cleaning both the exterior and interior. The staff was professional and friendly. Would definitely recommend to anyone looking for a quality car wash.",
  },
  {
    id: "2",
    carWashName: "Sparkle Auto Spa",
    carWashImage: "https://img.freepik.com/free-photo/professional-washer-blue-uniform-washing-luxury-car-with-water-gun-open-air-car-wash_496169-333.jpg",
    carWashAddress: "456 Park Avenue, Midtown, NY",
    reviewRating: 5.0,
    photos: [
      "https://img.freepik.com/free-photo/professional-washer-blue-uniform-washing-luxury-car-with-water-gun-open-air-car-wash_496169-333.jpg",
    ],
    createdAt: "2024-03-10",
    reviewText: "Best car wash in town! They use high-quality products and pay attention to every detail. My car looks brand new after every visit.",
  },
  {
    id: "3",
    carWashName: "Express Car Care",
    carWashImage: "https://img.freepik.com/free-photo/professional-washer-blue-uniform-washing-luxury-car-with-water-gun-open-air-car-wash_496169-333.jpg",
    carWashAddress: "789 Broadway, Upper West Side, NY",
    reviewRating: 3.5,
    photos: [],
    createdAt: "2024-03-05",
    reviewText: "Quick service but could be more thorough. Missed some spots on the wheels and didn't clean the windows properly. Decent for a basic wash though.",
  },
  {
    id: "4",
    carWashName: "Luxury Auto Detailing",
    carWashImage: "https://img.freepik.com/free-photo/professional-washer-blue-uniform-washing-luxury-car-with-water-gun-open-air-car-wash_496169-333.jpg",
    carWashAddress: "321 5th Avenue, Manhattan, NY",
    reviewRating: 4.8,
    photos: [
      "https://img.freepik.com/free-photo/professional-washer-blue-uniform-washing-luxury-car-with-water-gun-open-air-car-wash_496169-333.jpg",
      "https://img.freepik.com/free-photo/professional-washer-blue-uniform-washing-luxury-car-with-water-gun-open-air-car-wash_496169-333.jpg",
      "https://img.freepik.com/free-photo/professional-washer-blue-uniform-washing-luxury-car-with-water-gun-open-air-car-wash_496169-333.jpg",
    ],
    createdAt: "2024-02-28",
    reviewText: "Premium service that's worth every penny. The detailing work is exceptional, and they treat your car like it's their own. Highly recommended for luxury vehicles.",
  },
  {
    id: "5",
    carWashName: "Green Eco Wash",
    carWashImage: "https://img.freepik.com/free-photo/professional-washer-blue-uniform-washing-luxury-car-with-water-gun-open-air-car-wash_496169-333.jpg",
    carWashAddress: "567 Green Street, Brooklyn, NY",
    reviewRating: 4.2,
    photos: [
      "https://img.freepik.com/free-photo/professional-washer-blue-uniform-washing-luxury-car-with-water-gun-open-air-car-wash_496169-333.jpg",
    ],
    createdAt: "2024-02-20",
    reviewText: "Love their eco-friendly approach! They use biodegradable products that are just as effective as traditional cleaners. Great for environmentally conscious customers.",
  },
];

export default reviews;
