import type { Meta, StoryObj } from '@storybook/react';
import { CircleBadge } from '@/components/ui/circleBadge';

const meta = {
  title: 'UI/CircleBadge',
  component: CircleBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    text: { control: 'text' },
    size: { control: 'number' },
    backgroundColor: { control: 'color' },
    textColor: { control: 'color' },
  },
} satisfies Meta<typeof CircleBadge>;

export default meta;
type Story = StoryObj<typeof CircleBadge>;

export const Default: Story = {
  args: {
    text: '1',
  },
};

export const CustomSize: Story = {
  args: {
    text: '2',
    size: 32,
  },
};

export const CustomColors: Story = {
  args: {
    text: '3',
    backgroundColor: '#FF5733',
    textColor: '#FFFFFF',
  },
};