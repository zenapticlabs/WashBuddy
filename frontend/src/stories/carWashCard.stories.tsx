import type { Meta, StoryObj } from "@storybook/react";
import { CarWashCard } from "../components/organism/carWashCard";
import { ICarWashCard } from "@/types";

const meta = {
  title: "Organism/CarWashCard",
  component: CarWashCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CarWashCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseCarWash: ICarWashCard = {
  id: "1",
  image: "https://img.freepik.com/free-photo/professional-washer-blue-uniform-washing-luxury-car-with-water-gun-open-air-car-wash_496169-333.jpg",
  name: "Clean & Shine Car Wash",
  address: "123 Main St, Anytown, USA",
  price: 3.85,
  howFarAway: 1.2,
  rating: 4.8,
  reviewsCount: 100,
  washType: "Basic Wash",
  promotion: "Special WashBuddy Price",
};

export const Default: Story = {
  args: {
    data: baseCarWash,
  },
};

export const HighRating: Story = {
  args: {
    data: {
      ...baseCarWash,
      rating: 5.0,
      reviewsCount: 250,
    },
  },
};

export const LongDistance: Story = {
  args: {
    data: {
      ...baseCarWash,
      howFarAway: 15.7,
      name: "Far Away Car Wash",
    },
  },
};

export const PremiumWash: Story = {
  args: {
    data: {
      ...baseCarWash,
      price: 8.99,
      washType: "Premium Detail Wash",
      promotion: "Premium Service - 20% Off First Visit",
    },
  },
};

export const NoPromotion: Story = {
  args: {
    data: {
      ...baseCarWash,
      promotion: undefined,
    },
  },
}; 