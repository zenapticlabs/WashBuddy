import type { Meta, StoryObj } from '@storybook/react';
import DistanceRange from '../components/molecule/DistanceRange';

const meta: Meta<typeof DistanceRange> = {
  title: 'Molecule/DistanceRange',
  component: DistanceRange,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DistanceRange>;

export const Default: Story = {
  args: {
    minValue: 0,
    maxValue: 100,
  },
};

export const CustomRange: Story = {
  args: {
    value: 25,
    minValue: 0,
    maxValue: 50,
  },
};

export const Controlled: Story = {
  args: {
    value: 75,
    minValue: 0,
    maxValue: 100,
    onChange: (value) => console.log('Distance changed:', value),
  },
};

export const Uncontrolled: Story = {
  args: {},
};