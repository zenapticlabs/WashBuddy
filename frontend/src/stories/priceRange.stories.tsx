import type { Meta, StoryObj } from '@storybook/react';
import PriceRange from '../components/molecule/PriceRange';

const meta: Meta<typeof PriceRange> = {
  title: 'Molecule/PriceRange',
  component: PriceRange,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PriceRange>;

export const Default: Story = {
  args: {
    minValue: 0,
    maxValue: 100,
  },
};

export const CustomRange: Story = {
  args: {
    value: 250,
    minValue: 100,
    maxValue: 1000,
  },
};

export const Controlled: Story = {
  args: {
    value: 75,
    minValue: 0,
    maxValue: 100,
    onChange: (value) => console.log('Price changed:', value),
  },
};