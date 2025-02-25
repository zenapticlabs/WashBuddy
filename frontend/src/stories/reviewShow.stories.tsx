import type { Meta, StoryObj } from '@storybook/react';
import { ReviewShow } from '@/components/organism/reviewShow';

const meta: Meta<typeof ReviewShow> = {
  title: 'Organism/ReviewShow',
  component: ReviewShow,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ReviewShow>;

export const Default: Story = {
  args: {
    data: {
      id: '1',
      username: 'John Doe',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      reviewRating: 4,
      createdAt: new Date().toISOString(),
      reviewText: 'This is a short review that will not trigger the see more button.',
    },
  },
};

export const LongReview: Story = {
  args: {
    data: {
      id: '1',
      username: 'Jane Smith',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
      reviewRating: 5,
      createdAt: new Date().toISOString(),
      reviewText: 'This is a very long review that will definitely need the see more button. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    },
  },
};

export const NoAvatar: Story = {
  args: {
    data: {
      id: '1',
      username: 'Anonymous User',
      reviewRating: 3,
      createdAt: new Date().toISOString(),
      reviewText: 'This is a review from a user without an avatar.',
    },
  },
};