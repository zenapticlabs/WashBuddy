import type { Meta, StoryObj } from "@storybook/react";
import { ReviewShow } from "../components/organism/reviewShow";

const meta = {
  title: "Organisms/ReviewShow",
  component: ReviewShow,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ReviewShow>;

export default meta;
type Story = StoryObj<typeof ReviewShow>;

export const Default: Story = {
  args: {
    username: "John Doe",
    avatar: "https://via.placeholder.com/40",
    reviewText: "Great product! Really satisfied with the quality and service.",
    reviewRating: 5,
    createdAt: new Date().toISOString(),
  },
};

export const LongReview: Story = {
  args: {
    username: "Jane Smith",
    avatar: "https://via.placeholder.com/40",
    reviewText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    reviewRating: 4,
    createdAt: "2024-03-10T10:30:00Z",
  },
};

export const WithPhotos: Story = {
  args: {
    username: "Alice Johnson",
    avatar: "https://via.placeholder.com/40",
    reviewText: "The product exceeded my expectations. Here are some photos of what I received.",
    reviewRating: 5,
    photos: [
      "https://via.placeholder.com/300",
      "https://via.placeholder.com/300",
      "https://via.placeholder.com/300",
    ],
    createdAt: "2024-03-15T15:45:00Z",
  },
};

export const LowRating: Story = {
  args: {
    username: "Bob Wilson",
    avatar: "https://via.placeholder.com/40",
    reviewText: "Not what I expected. The quality could be better.",
    reviewRating: 2,
    createdAt: "2024-03-18T09:15:00Z",
  },
};