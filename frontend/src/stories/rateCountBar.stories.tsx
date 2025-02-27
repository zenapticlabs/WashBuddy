import type { Meta, StoryObj } from '@storybook/react';
import { RateCountBar } from '@/components/ui/RateCountBar';

const meta: Meta<typeof RateCountBar> = {
  title: 'UI/RateCountBar',
  component: RateCountBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RateCountBar>;

export const Default: Story = {
  args: {
    total: 100,
    value: 65,
    mark: 5,
  },
};

export const EmptyBar: Story = {
  args: {
    total: 100,
    value: 0,
    mark: 1,
  },
};

export const FullBar: Story = {
  args: {
    total: 100,
    value: 100,
    mark: 5,
  },
};

export const PartialFill: Story = {
  args: {
    total: 200,
    value: 42,
    mark: 3,
  },
};