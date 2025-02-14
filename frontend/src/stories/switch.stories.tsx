import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from '@/components/ui/switch';

const meta: Meta<typeof Switch> = {
  title: 'UI/Switch',
  component: Switch,
  tags: ['autodocs'],
  args: {
    // Default args
    label: 'Switch Label',
  },
  argTypes: {
    labelPosition: {
      control: 'radio',
      options: ['start', 'end'],
    },
    checked: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: {
    label: 'Toggle me',
  },
};

export const LabelStart: Story = {
  args: {
    label: 'Label at start',
    labelPosition: 'start',
  },
};

export const LabelEnd: Story = {
  args: {
    label: 'Label at end',
    labelPosition: 'end',
  },
};

export const NoLabel: Story = {
  args: {
    label: undefined,
  },
};

export const Checked: Story = {
  args: {
    label: 'Checked Switch',
    checked: true,
  },
};