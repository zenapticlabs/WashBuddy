import type { Meta, StoryObj } from '@storybook/react';
import { CarWashCard } from '@/components/organism/carWashCard';

const meta: Meta<typeof CarWashCard> = {
  title: 'Organisms/CarWashCard',
  component: CarWashCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CarWashCard>;

const mockCarWashData = {
  car_wash_name: "Sparkle & Shine Auto Wash",
  formatted_address: "123 Main Street, City, State",
  reviews_average: "4.5",
  reviews_count: 128,
  wash_types: ["Basic", "Premium", "Deluxe"],
  id: 1,
  latitude: 0,
  longitude: 0,
  amenities: ["Vacuum", "Air Freshener"],
  carwashoperatinghours_set: [],
  carwashimage_set: [],
  street: "123 Main Street",
  city: "City",
  state: "State",
  state_code: "ST",
  postal_code: "12345",
  country: "United States",
  country_code: "US",
  phone: "555-0123",
  location: {
    type: "Point",
    coordinates: [0, 0] as [number, number]
  },
  automatic_car_wash: true,
  self_service_car_wash: false,
  open_24_hours: false,
  verified: true,
  created_at: "2024-01-01",
  updated_at: "2024-01-01"
};

export const Default: Story = {
  args: {
    data: mockCarWashData,
    onClick: () => console.log("Card clicked"),
  },
};

export const HighRating: Story = {
  args: {
    data: {
      ...mockCarWashData,
      reviews_average: "5.0",
      reviews_count: 250,
    },
    onClick: () => console.log("Card clicked"),
  },
};

export const LowRating: Story = {
  args: {
    data: {
      ...mockCarWashData,
      reviews_average: "2.5",
      reviews_count: 45,
    },
    onClick: () => console.log("Card clicked"),
  },
};

export const LongName: Story = {
  args: {
    data: {
      ...mockCarWashData,
      car_wash_name: "Super Deluxe Premium Professional Auto Washing & Detailing Center",
      formatted_address: "987 Very Long Street Name, City With A Long Name, State",
    },
    onClick: () => console.log("Card clicked"),
  },
};